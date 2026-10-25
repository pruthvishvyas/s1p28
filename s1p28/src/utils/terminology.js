// Builds sidebar tabs using the client's own words (from the contract terminology map)
export function buildTabs(term) {
  const routes = term('transaction', true);
  return [
    { outcome: 'UNDERSTAND', blurb: 'What is happening now', items: [
      { id: 'kpis', label: 'Your Numbers', title: 'Your Numbers', sub: 'The key figures for your whole ' + term('transaction').toLowerCase() + ' network' },
      { id: 'charts', label: 'Analysis Charts', title: 'Analysis Charts', sub: 'Charts that answer one business question each' },
      { id: 'segments', label: 'Segment Explorer', title: 'Segment Explorer', sub: 'The different kinds of ' + routes.toLowerCase() + ' you run' },
      { id: 'anomalies', label: 'Anomaly Explorer', title: 'Anomaly Explorer', sub: 'Unusual ' + routes.toLowerCase() + ' worth a closer look' }
    ] },
    { outcome: 'DECIDE', blurb: 'What to do about it', items: [
      { id: 'insights', label: 'Insights', title: 'Insights', sub: 'What the data shows, with the action to take this week' },
      { id: 'recommendations', label: 'Recommendations', title: 'Recommendations', sub: 'Prioritised actions with the money at stake' },
      { id: 'whatif', label: 'What-If Simulator', title: 'What-If Simulator', sub: 'See the effect of a change before you make it' },
      { id: 'goals', label: 'Goal Tracker', title: 'Goal Tracker', sub: 'Your targets, and where you stand against them' }
    ] },
    { outcome: 'MONITOR', blurb: 'Is it on track', items: [
      { id: 'forecast', label: 'Forecaster', title: 'Forecaster', sub: 'What the next weeks look like' },
      { id: 'progress', label: 'Goal Progress', title: 'Goal Progress', sub: 'This week against last week and against your targets' },
      { id: 'alerts', label: 'Alert Center', title: 'Alert Center', sub: 'Things that need your attention right now' }
    ] },
    { outcome: 'TOOLS', blurb: 'Explore and learn', items: [
      { id: 'explorer', label: 'Interactive Explorer', title: 'Interactive Explorer', sub: 'Click any chart to filter everything else' },
      { id: 'manual', label: 'User Manual', title: 'User Manual', sub: 'Plain-English guide to every screen' }
    ] }
  ];
}
