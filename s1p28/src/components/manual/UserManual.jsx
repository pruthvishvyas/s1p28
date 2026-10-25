import { useState, useMemo } from 'react';
import { useContract } from '../../hooks/shared/useContract';
import { useTerm } from '../shared/TerminologyProvider';
import { ManualSection } from './ManualSection';
import { GlossaryTable } from './GlossaryTable';

export function UserManual() {
  const term = useTerm();
  const { contract } = useContract();
  const [q, setQ] = useState('');
  const name = (contract && contract.project && contract.project.name) || 'Your dashboard';
  const rev = term('revenue'), cust = term('customer'), prod = term('product'), tx = term('transaction');
  const txs = term('transaction', true).toLowerCase();
  const prods = term('product', true).toLowerCase();

  const sections = useMemo(() => [
    { id: 'start', title: 'How to use this dashboard', paragraphs: [
      'This dashboard answers three questions about your business, one after the other.',
      { h: 'UNDERSTAND -', t: 'What is happening right now? Your key numbers, charts, groups of ' + txs + ' and anything unusual.' },
      { h: 'DECIDE -', t: 'What should I do about it? Plain-English insights, recommendations and a what-if tool.' },
      { h: 'MONITOR -', t: 'Am I on track without checking by hand? A look ahead, progress against your targets and alerts.' },
      'Use the menu on the left to move between screens. The moon or sun button at the top switches between a light and a dark look.'] },
    { id: 'numbers', title: 'UNDERSTAND - Your Numbers', paragraphs: [
      { h: 'What you see:', t: 'Big tiles with your ' + rev.toLowerCase() + ', profit, margin, how many ' + txs + ' lose money, and how reliable your deliveries are.' },
      { h: 'What it means:', t: 'Margin is the share of every unit of ' + rev.toLowerCase() + ' you keep as profit. A negative number means you spend more than you earn.' },
      { h: 'What to do:', t: 'Start here every week. If the share of loss-making ' + txs + ' is high, go to the Insights screen to see why.' }] },
    { id: 'charts', title: 'UNDERSTAND - Analysis Charts', paragraphs: [
      { h: 'What you see:', t: 'Each chart answers one question, written above it.' },
      { h: 'Reading a bar chart:', t: 'Each bar is a group. The taller the bar, the bigger the number. Red bars are below zero (a loss).' },
      { h: 'Reading a line chart:', t: 'The line shows how a number moves day by day. Going up is improving, going down is getting worse.' },
      { h: 'Reading a colour grid:', t: 'Green cells earn money, red cells lose money. The stronger the colour, the bigger the amount.' },
      { h: 'What to look for:', t: 'Red areas that keep showing up in several charts.' }] },
    { id: 'segments', title: 'UNDERSTAND - Segment Explorer', paragraphs: [
      { h: 'What you see:', t: 'Your ' + txs + ' sorted into a few groups that behave alike, with the margin and size of each group.' },
      { h: 'What to do:', t: 'Look at the group that loses money and ask what its ' + txs + ' have in common (speed, load, failed stops).' }] },
    { id: 'anomalies', title: 'UNDERSTAND - Anomaly Explorer', paragraphs: [
      { h: 'What you see:', t: 'A list of ' + txs + ' that do not look like the rest, with the main reason.' },
      { h: 'What to do:', t: 'Open the worst ones first. They are often a one-off problem you can fix quickly.' }] },
    { id: 'insights', title: 'DECIDE - Insights', paragraphs: [
      'Every insight states what the data shows, the proof, and one thing to do this week.',
      { h: 'HIGH (red) -', t: 'needs attention this week.' }, { h: 'MEDIUM (amber) -', t: 'review this month.' }, { h: 'LOW (green) -', t: 'good to know.' },
      { h: 'Money at stake:', t: 'The amount that is lost or leaked in that area, so you can compare issues.' }] },
    { id: 'recs', title: 'DECIDE - Recommendations', paragraphs: [
      'Each recommendation tells you what to do, why (the evidence), how much money is at stake and where to start.',
      { h: 'Action list:', t: 'A list of individual ' + txs + ' with a priority. P1 means urgent. Click a column heading to sort.' }] },
    { id: 'whatif', title: 'DECIDE - What-If Simulator', paragraphs: [
      'Use this to explore: "What would happen if I changed one thing?"',
      { h: 'How:', t: 'Pick a scenario, then move the slider. The tiles show projected profit and margin straight away.' },
      { h: 'Price scenarios:', t: 'The extra choice describes how many ' + cust.toLowerCase() + 's you would lose if you raised prices. Not sensitive means none.' }] },
    { id: 'goals', title: 'DECIDE - Goal Tracker', paragraphs: [
      'Shows your targets. Where it says "you set this", type your own target. It is saved in this browser only.'] },
    { id: 'forecast', title: 'MONITOR - Forecaster', paragraphs: [
      'Our best estimate of the next weeks, based on your own history, with a likely range around it.',
      { h: 'Ask the forecaster:', t: 'Choose a day (1 is tomorrow) to see the expected figure.' },
      { h: 'Remember:', t: 'A forecast is a guide, not a promise. The shaded range shows how far it can be off.' }] },
    { id: 'progress', title: 'MONITOR - Goal Progress', paragraphs: [
      'Compares the most recent days with your targets and with the days before. Green means on track, red means off track.'] },
    { id: 'alerts', title: 'MONITOR - Alert Center', paragraphs: [
      'Lists things that need attention now, each with a suggested action. An empty list is good news.'] },
    { id: 'explorer', title: 'Interactive Explorer', paragraphs: [
      { h: 'Click any bar', t: 'to filter everything else on the page and open a detail panel for that group.' },
      { h: 'Measure and Group by', t: 'choose what to add up and how to split it.' },
      { h: 'Date range and drop-downs', t: 'at the top narrow the view. Press Clear filters to start again.' },
      { h: 'Copy summary', t: 'puts the current numbers on your clipboard so you can paste them in an email.' }] }
  ], [contract]);

  const glossary = useMemo(() => [
    [rev, 'The money you earn from ' + prods + ' delivered.'],
    [cust, 'The person or business that receives a ' + prod.toLowerCase() + '.'],
    [prod, 'One item delivered to a ' + cust.toLowerCase() + '.'],
    [tx, 'One driver journey with its stops, from leaving the depot to coming back.'],
    ['Margin', 'Profit as a share of ' + rev.toLowerCase() + '. Negative means a loss.'],
    ['Loss-making ' + tx.toLowerCase(), 'A ' + tx.toLowerCase() + ' that cost more than it earned.'],
    ['Anomaly', 'An unusual ' + tx.toLowerCase() + ' that does not match your normal business behaviour.'],
    ['Forecast', 'Our prediction of your future figures based on your historical patterns.'],
    ['Segment', 'A group of ' + txs + ' that behave in a similar way.'],
    ['Overtime', 'Hours worked beyond the planned day.'],
    ['First-attempt success', 'The share of stops where the ' + prod.toLowerCase() + ' was delivered on the first try.'],
    ['On-time delivery', 'The share of ' + prods + ' delivered inside the promised time.'],
    ['Load', 'How full the vehicle is when it leaves.'],
    ['Priority (P1 to P4)', 'How urgently a ' + tx.toLowerCase() + ' needs action. P1 is most urgent.'],
    ['Severity', 'How serious an insight or alert is: HIGH, MEDIUM or LOW.'],
    ['What-if scenario', 'A prepared "what happens if" calculation.'],
    ['Price sensitivity', 'How much demand drops when prices go up.'],
    ['Cross-filter', 'Clicking one chart to filter all the others.'],
    ['Drill-down', 'Opening the detail behind one bar or number.'],
    ['Likely range', 'The band in which the real figure will probably fall.']
  ], [contract]);

  const s = q.trim().toLowerCase();
  const matches = id => !s || sections.find(x => x.id === id && (x.title + ' ' + x.paragraphs.map(p => (typeof p === 'string' ? p : p.h + ' ' + p.t)).join(' ')).toLowerCase().includes(s));
  const shown = sections.filter(x => matches(x.id));

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>{name} - Your Analytics Guide</h3>
      <div className="table-tools no-print">
        <input type="search" placeholder="Search the manual..." value={q} onChange={e => setQ(e.target.value)} style={{ minWidth: 260 }} />
        <button className="btn secondary" onClick={() => { try { window.print(); } catch (e) { /* ignore */ } }}>Print this manual</button>
      </div>
      <div className="manual-toc no-print">
        {sections.map(x => <a key={x.id} className="chip" href={'#manual-' + x.id} onClick={e => { e.preventDefault(); const el = document.getElementById('manual-' + x.id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>{x.title.replace(/^[A-Z]+ - /, '')}</a>)}
      </div>
      {shown.map(x => <ManualSection key={x.id} id={x.id} title={x.title} paragraphs={x.paragraphs} q={s} match />)}
      {shown.length === 0 && <p className="muted">Nothing in the guide matches that search.</p>}
      <h3 className="section-title">Glossary</h3>
      <GlossaryTable entries={glossary} q={s} />
    </div>
  );
}
