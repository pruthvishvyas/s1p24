import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useForecast, lookupForecast } from '../../hooks/monitor/useForecast.js';
import { validateForecast } from '../../utils/dataValidator.js';
import { useThemeColors } from '../../hooks/shared/useTheme.js';
import { useTerm } from '../shared/TerminologyProvider.jsx';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { ErrorBoundary } from '../shared/ErrorBoundary.jsx';
import { fmtNum, fmtPct, shortDate } from '../../utils/formatters.js';

const MODEL = { ridge: 'trend and seasonal pattern', gbr: 'machine-learning model', hybrid: 'trend plus machine-learning model', naive_last: 'same-as-last-week rule', seasonal_naive: 'same-week-last-year rule' };

function Inner({ d }) {
  const term = useTerm();
  const c = useThemeColors();
  const keys = Object.keys(d.series).filter((k) => Array.isArray(d.series[k]) && d.series[k].length);
  const [metric, setMetric] = useState(keys[0]);
  const [weeks, setWeeks] = useState(1);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const name = (k) => (k === 'Total_Revenue' ? term('revenue') : k === 'Total_Operating_Cost' ? 'Operating cost' : k === 'Operating_Profit' ? 'Operating profit' : k.replace(/_/g, ' '));
  const rows = d.series[metric] || [];
  const acc = (d.accuracy || {})[metric];
  const go = async () => { setBusy(true); setRes(await lookupForecast(weeks, metric, d.series)); setBusy(false); };
  return (
    <div className="stack">
      <div className="chips">{keys.map((k) => <button key={k} className={'chip' + (metric === k ? ' on' : '')} onClick={() => { setMetric(k); setRes(null); }}>{name(k)}</button>)}</div>
      <div className="card">
        <h3>{name(metric)} - next {rows.length} weeks (forecast)</h3>
        <div className="chart-box">
          <ErrorBoundary>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={rows.map((r) => ({ ...r, week: shortDate(r.week) }))} margin={{ top: 10, right: 20, bottom: 24, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                <XAxis dataKey="week" tick={{ fill: c.text, fontSize: 12 }} />
                <YAxis tick={{ fill: c.text, fontSize: 12 }} tickFormatter={(v) => fmtNum(v, 1)} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: 8 }} formatter={(v) => fmtNum(v, 2)} />
                <Legend />
                <Line type="monotone" dataKey="forecast" name="Forecast" stroke={c.accent} strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="upper_80" name="Upper range" stroke={c.series[1]} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="lower_80" name="Lower range" stroke={c.series[3]} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ErrorBoundary>
        </div>
        <p className="tiny muted">{d.label || 'A forecast is a prediction, not a promise.'} The range covers about 8 in 10 outcomes seen in testing.</p>
      </div>
      {acc && (
        <div className="card small">
          <b>How reliable is this?</b> Best method: {MODEL[acc.chosen] || acc.chosen}. In a test on the last {acc.holdout_weeks} weeks the average miss was {fmtNum(acc.mae)} per week
          ({fmtPct(acc.mape_pct)}), compared with {fmtPct(acc.naive_last_mape_pct)} for simply repeating last week.
        </div>
      )}
      <div className="card">
        <h3>Look up one week</h3>
        <div className="row">
          <label className="small">Weeks ahead <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>{rows.map((r, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
          <button className="btn" onClick={go} disabled={busy}>{busy ? 'Looking up...' : 'Look up'}</button>
        </div>
        {res && (res.ok
          ? <p className="small">Week of {shortDate(res.week)}: <b>{fmtNum(res.prediction)}</b> (range {fmtNum(res.range_low)} to {fmtNum(res.range_high)})</p>
          : <p className="small bad">{res.error}</p>)}
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Week</th><th className="num">Forecast</th><th className="num">Lower</th><th className="num">Upper</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.week}><td>{shortDate(r.week)}</td><td className="num">{fmtNum(r.forecast)}</td><td className="num">{fmtNum(r.lower_80)}</td><td className="num">{fmtNum(r.upper_80)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Forecaster() {
  const state = useForecast();
  return <DataBoundary state={state} validate={validateForecast} emptyMessage="No forecast available yet.">{(d) => <Inner d={d} />}</DataBoundary>;
}
