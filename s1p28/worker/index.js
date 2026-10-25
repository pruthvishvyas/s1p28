import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

const assetManifest = JSON.parse(manifestJSON);

const PROJECT_NAME = "Last-Mile Delivery Network";
const DATA = {"kpis": "understand/kpis.json", "insights": "decide/insights.json", "anomalies": "understand/anomalies.json", "recommendations": "decide/recommendations.json", "forecast": "monitor/forecast.json", "goal_progress": "monitor/goal_progress.json", "alerts": "monitor/alerts.json", "run_log": "meta/run_log.json", "summary": "meta/summary.json"};

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (method === "POST" && url.pathname === "/api") {
      return handleForecast(request, env, ctx);
    }
    if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
      return handleMCP(request, env, ctx, url);
    }
    return serveAsset(request, env, ctx);
  }
};

// ---------- static assets with SPA fallback ----------
async function serveAsset(request, env, ctx) {
  try {
    return await getAssetFromKV(
      { request, waitUntil: ctx.waitUntil.bind(ctx) },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
        mapRequestToAsset: (req) => {
          const u = new URL(req.url);
          if (!u.pathname.includes(".")) {
            u.pathname = "/index.html";
            return new Request(u.toString(), req);
          }
          return req;
        }
      }
    );
  } catch (err) {
    const p = new URL(request.url).pathname;
    if (p.includes(".")) {
      return new Response("Not found", { status: 404 });
    }
    try {
      const fallback = new Request(new URL("/index.html", request.url).toString(), request);
      const res = await getAssetFromKV(
        { request: fallback, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
      );
      return new Response(res.body, { status: 200, headers: res.headers });
    } catch (e) {
      return new Response("Not found", { status: 404 });
    }
  }
}

// Read a deployed JSON file straight from the asset store (never a self-fetch)
async function readJSON(path, request, env, ctx) {
  try {
    const u = new URL(request.url);
    u.pathname = path;
    u.search = "";
    const req = new Request(u.toString(), { method: "GET" });
    const res = await getAssetFromKV(
      { request: req, waitUntil: ctx.waitUntil.bind(ctx) },
      { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
    );
    return await res.json();
  } catch (e) {
    return null;
  }
}

// ---------- Forecaster API ----------
// Body: { "input": <day number 1..horizon>, "metric": "profit" | "routes" | "parcels" | "revenue" }
async function handleForecast(request, env, ctx) {
  try {
    const body = await request.json().catch(() => ({}));
    const inputVal = Number(body.input);
    if (body.input === undefined || body.input === null || body.input === "" || isNaN(inputVal)) {
      return json({ error: "Invalid input value. Must be a number." }, 400);
    }
    const metric = typeof body.metric === "string" && body.metric ? body.metric : "profit";

    let lookup = null;
    let source = "secret";
    if (env.FORECAST_LOOKUP && metric === "profit") {
      try {
        lookup = JSON.parse(env.FORECAST_LOOKUP);
      } catch (e) {
        return json({ error: "FORECAST_LOOKUP secret is not valid JSON." }, 500);
      }
    }
    if (!lookup) {
      source = "forecast.json";
      const fc = await readJSON("/data/" + DATA.forecast, request, env, ctx);
      const rows = fc && Array.isArray(fc.rows) ? fc.rows : [];
      if (rows.length === 0) {
        return json({ error: "Forecast data not configured. Run: wrangler secret put FORECAST_LOOKUP" }, 503);
      }
      if (rows[0][metric + "_forecast"] === undefined) {
        return json({ error: "Unknown metric: " + metric }, 400);
      }
      lookup = {};
      rows.forEach((r, i) => {
        lookup[String(i + 1)] = {
          value: r[metric + "_forecast"],
          range_low: r[metric + "_lower"] ?? null,
          range_high: r[metric + "_upper"] ?? null
        };
      });
    }

    const keys = Object.keys(lookup).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
    if (keys.length === 0) {
      return json({ error: "Forecast lookup table is empty." }, 503);
    }
    const nearest = keys.reduce((a, b) => Math.abs(b - inputVal) < Math.abs(a - inputVal) ? b : a);
    const result = lookup[String(nearest)];
    const isObj = result !== null && typeof result === "object";
    return json({
      prediction: isObj ? (result.value ?? null) : (result ?? null),
      confidence: isObj ? (result.confidence ?? null) : null,
      range_low: isObj ? (result.range_low ?? null) : null,
      range_high: isObj ? (result.range_high ?? null) : null,
      input_received: inputVal,
      nearest_key: nearest,
      metric: metric,
      source: source
    }, 200);
  } catch (e) {
    return json({ error: "Forecast error: " + e.message }, 500);
  }
}

// ---------- Read-only MCP tools ----------
const TOOLS = [
  { name: "get_kpis", description: "Get all current KPI values for " + PROJECT_NAME, path: DATA.kpis },
  { name: "get_insights", description: "Get business insights ranked by severity (HIGH/MEDIUM/LOW)", path: DATA.insights,
    props: { severity: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "ALL"], default: "ALL" } } },
  { name: "get_anomalies", description: "Get detected anomalies and unusual business patterns", path: DATA.anomalies },
  { name: "get_recommendations", description: "Get prioritized action recommendations for the business", path: DATA.recommendations },
  { name: "get_forecast", description: "Get the latest forecast data and predictions", path: DATA.forecast },
  { name: "get_goal_progress", description: "Get progress against the business goals", path: DATA.goal_progress },
  { name: "get_alerts", description: "Get the current alerts", path: DATA.alerts },
  { name: "get_summary", description: "Get pipeline run summary and data freshness info", path: null }
];

function manifest() {
  return {
    name: PROJECT_NAME + " Analytics MCP",
    description: "Read-only business analytics tools for " + PROJECT_NAME,
    version: "1.0.0",
    tools: TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: { type: "object", properties: t.props || {}, required: [] }
    }))
  };
}

async function runTool(tool, params, request, env, ctx) {
  const def = TOOLS.find(t => t.name === tool);
  if (!def) {
    return { status: 400, body: { error: "Unknown tool: \"" + tool + "\". Call GET /mcp for available tools." } };
  }
  if (tool === "get_summary") {
    const runLog = await readJSON("/data/" + DATA.run_log, request, env, ctx);
    const summary = await readJSON("/data/" + DATA.summary, request, env, ctx);
    return { status: 200, body: { tool, result: { run_log: runLog, summary } } };
  }
  const data = def.path ? await readJSON("/data/" + def.path, request, env, ctx) : null;
  if (!data) {
    return { status: 503, body: { error: def.name + ": data not available. Run the pipeline and deploy again." } };
  }
  if (tool === "get_insights") {
    const sev = String((params && params.severity) || "ALL").toUpperCase();
    const out = sev === "ALL" || !Array.isArray(data) ? data : data.filter(i => i.severity === sev);
    return { status: 200, body: { tool, result: out, filter: sev } };
  }
  return { status: 200, body: { tool, result: data } };
}

async function handleMCP(request, env, ctx, url) {
  const method = request.method;
  if (method === "GET") {
    return json(manifest(), 200);
  }
  if (method !== "POST") {
    return json({ error: "MCP: use GET /mcp for the manifest, POST /mcp to call tools." }, 405);
  }
  try {
    const body = await request.json().catch(() => ({}));

    // JSON-RPC (standard MCP clients)
    if (body && body.jsonrpc === "2.0") {
      const id = body.id ?? null;
      const rpc = (result) => json({ jsonrpc: "2.0", id, result }, 200);
      const rpcErr = (code, message) => json({ jsonrpc: "2.0", id, error: { code, message } }, 200);
      switch (body.method) {
        case "initialize":
          return rpc({
            protocolVersion: (body.params && body.params.protocolVersion) || "2025-03-26",
            capabilities: { tools: {} },
            serverInfo: { name: PROJECT_NAME + " Analytics MCP", version: "1.0.0" }
          });
        case "notifications/initialized":
        case "notifications/cancelled":
          return new Response(null, { status: 202, headers: CORS });
        case "ping":
          return rpc({});
        case "tools/list":
          return rpc({ tools: manifest().tools });
        case "tools/call": {
          const p = body.params || {};
          const r = await runTool(p.name, p.arguments || {}, request, env, ctx);
          return rpc({ content: [{ type: "text", text: JSON.stringify(r.body) }], isError: r.status >= 400 });
        }
        default:
          return rpcErr(-32601, "Method not found: " + body.method);
      }
    }

    // Simple REST style: { "tool": "get_kpis", "params": {} }
    const tool = body.tool ?? body.name ?? "";
    const params = body.params ?? body.arguments ?? {};
    const r = await runTool(tool, params, request, env, ctx);
    return json(r.body, r.status);
  } catch (e) {
    return json({ error: "MCP error: " + e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}
