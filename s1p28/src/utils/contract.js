export function getPath(obj, dotted) {
  return String(dotted).split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

export function dataUrl(rel) {
  if (!rel || typeof rel !== 'string') return null;
  return '/data/' + rel.replace(/^\/+/, '');
}

export function contractFiles(contract, prefix) {
  const files = contract && Array.isArray(contract.files) ? contract.files : [];
  return files
    .map(f => (f && f.filename) || '')
    .filter(n => typeof n === 'string' && n.startsWith(prefix) && n.endsWith('.json'))
    .sort();
}

// chart entries store "charts/<id>.json" relative to the outcome folder that holds the chart folder
export function resolveChartPath(indexRel, file) {
  if (!indexRel || !file) return null;
  const parts = indexRel.split('/');
  const parent = parts.slice(0, -2).join('/');
  return dataUrl((parent ? parent + '/' : '') + file);
}
