import { useState } from 'react';
import { useTerm } from '../shared/TerminologyProvider.jsx';
import { useContract } from '../../hooks/shared/useContract.js';
import { ManualSection } from './ManualSection.jsx';
import { GlossaryTable } from './GlossaryTable.jsx';

export function UserManual() {
  const term = useTerm();
  const { contract } = useContract();
  const [q, setQ] = useState('');
  const rev = term('revenue'), cust = term('customer'), prod = term('product'), tx = term('transaction');
  const sections = [
    ['How to use this dashboard', [
      'This dashboard has three jobs. UNDERSTAND shows what is happening in your business right now. DECIDE tells you what to do about it. MONITOR checks that you are on track without you having to look.',
      'Use the menu on the left. Each menu item is one tab, and each tab is explained below. The sun/moon button at the top switches between light and dark.']],
    ['UNDERSTAND - Your Numbers', [
      'What you see: the headline figures for the last 13 weeks, such as ' + rev + ', operating profit and how many ' + tx.toLowerCase() + 's you handled, each compared with the 13 weeks before.',
      'What it means: a green arrow means the change is good for the business, a red arrow means it is not. For some figures, such as the operating ratio, lower is better.',
      'What to do: if a red arrow appears on something important, open the Insights tab to see why.']],
    ['UNDERSTAND - Analysis Charts', [
      'Each chart answers one question, written above it. A line chart shows how something moves week by week: look for the direction, not each wiggle. A bar chart compares sizes: the longer the bar, the bigger the number. A dot chart shows each week as one dot: if the dots slope upward, the two things tend to rise together.',
      'What to look for: the gap between the revenue line and the cost line is your profit. When the lines get close, the business is under pressure.']],
    ['UNDERSTAND - Unusual Weeks', [
      'These are weeks that do not look like your normal pattern. The table shows the main reason for each one. An unusual week is not always bad, but it is always worth a look.']],
    ['UNDERSTAND - Week Types', [
      'Your weeks are sorted into groups, for example Efficient or Stressed, based on how the business ran. The bar of colours shows when each type happened, oldest on the left. The table shows what an average week of each type looks like.']],
    ['DECIDE - Insights', [
      'Severity explained: HIGH needs attention this week. MEDIUM should be reviewed this month. LOW is good to know. Insights are ranked by the money they may be worth.',
      'Every insight shows the finding, the numbers behind it, and one action.']],
    ['DECIDE - Recommendations', [
      'Each recommendation tells you what to do, how often the warning appeared in the last 13 weeks, and when it last appeared. The more recent and frequent, the higher the priority.']],
    ['DECIDE - What-If Simulator', [
      'Use it to ask: what would happen if something changed? Drag the slider and read the new profit, operating ratio or cash. The orange-highlighted bar is your current choice. The small print under each simulator lists what was assumed.']],
    ['DECIDE - Goal Tracker', [
      'These are the targets the dashboard measures you against. You can type your own target in the box. It is saved in your browser only.']],
    ['MONITOR - Forecast', [
      'Our prediction of your ' + rev + ', cost and profit for the next weeks. The dashed lines show a range that would have covered about 8 in 10 weeks in testing. A forecast is a prediction, not a promise.']],
    ['MONITOR - Goal Progress and Alert Center', [
      'Goal Progress shows each target with a bar: a full bar means the target is met. The Alert Center lists anything that needs attention right now. No alerts means everything is inside your limits.']],
    ['Interactive Explorer', [
      'Use the filter bar at the top to pick dates, a week type, or only unusual weeks. All numbers and charts update together. Click a bar to filter by that week type, or click a row in the table to see that week in detail. Use Copy summary to paste a short description of your current view elsewhere.']]
  ];
  const gloss = [
    [rev, 'The money earned from moving freight, including fuel surcharges and extra charges.'],
    [cust, 'A business that pays you to move its goods.'], [prod, 'A way of moving goods, such as full truckload or rail.'], [tx, 'One delivery of goods for a ' + cust.toLowerCase() + '.'],
    ['Operating ratio', 'Costs as a share of revenue. 90% means 90 of every 100 earned goes to running costs. Lower is better.'],
    ['Operating profit', 'Revenue minus the cost of running the business, before interest and tax.'],
    ['Receivable days', 'The average number of days customers take to pay you.'],
    ['Empty kilometres', 'Distance driven without freight on board. It costs fuel and time but earns nothing.'],
    ['Unusual week', 'A week that does not match your normal business pattern.'],
    ['Forecast', 'Our prediction of your future numbers based on your history.'],
    ['Week type', 'A group of weeks that looked alike in how the business ran.'],
    ['4-week average', 'The average of the latest four weeks. It smooths out single-week bumps.']
  ].concat(Object.entries(contract.terminology || {}).map(([k, v]) => ['Your word for ' + k, v]));
  const match = (s) => !q || s.toLowerCase().includes(q.toLowerCase());
  const shown = sections.filter(([t, ps]) => match(t) || ps.some(match));
  const gShown = gloss.filter(([k, v]) => match(k) || match(v));
  return (
    <div className="manual">
      <div className="row no-print" style={{ marginBottom: 16 }}>
        <input type="search" placeholder="Search this guide" value={q} onChange={(e) => setQ(e.target.value)} style={{ minWidth: 260 }} />
        <button className="btn ghost" onClick={() => window.print()}>Print this guide</button>
      </div>
      <h2 style={{ marginTop: 0 }}>{contract.project.name} - Your Analytics Guide</h2>
      {shown.map(([t, ps]) => <ManualSection key={t} title={t} paragraphs={ps} q={q} />)}
      {shown.length === 0 && <p className="muted">No section matches your search.</p>}
      <h2>Glossary</h2>
      {gShown.length ? <GlossaryTable entries={gShown} q={q} /> : <p className="muted">No glossary word matches your search.</p>}
    </div>
  );
}
