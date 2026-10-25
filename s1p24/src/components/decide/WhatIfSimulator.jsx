import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSimulationPath } from '../../hooks/decide/useSimulations.js';
import { useData } from '../../hooks/useData.js';
import { validateSim } from '../../utils/dataValidator.js';
import { useThemeColors } from '../../hooks/shared/useTheme.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { ErrorBoundary } from '../shared/ErrorBoundary.jsx';
import { fmtNum, fmtPct } from '../../utils/formatters.js';

const sign = (v) => (v > 0 ? '+' + v : String(v));
const SIMS = [
  { match: 'fuel_price', title: 'If fuel prices change', v: 'fuel_price_change_pct', vLabel: (v) => sign(v) + '% fuel price',
    out: [['weekly_profit_change', 'Weekly profit change', 'n'], ['new_weekly_profit', 'New weekly profit', 'n'], ['new_operating_ratio_pct', 'New operating ratio', 'p'], ['annualized_profit_change', 'Profit change per year', 'n']], chart: 'annualized_profit_change' },
  { match: 'empty_km', title: 'If empty running is reduced', v: 'empty_km_reduction_pct', vLabel: (v) => v + '% fewer empty km',
    out: [['avoided_km_per_week', 'Kilometres avoided per week', 'n'], ['weekly_cost_saving', 'Weekly cost saving', 'n'], ['new_operating_ratio_pct', 'New operating ratio', 'p'], ['annualized_saving', 'Saving per year', 'n']], chart: 'annualized_saving' },
  { match: 'dso', title: 'If customers pay faster', v: 'dso_reduction_days', vLabel: (v) => v + ' days faster',
    out: [['new_dso_days', 'New receivable days', 'n'], ['cash_released', 'Cash released', 'n']], chart: 'cash_released' }
];

function SimCard({ cfg }) {
  const path = useSimulationPath(cfg.match);
  const state = useData(path);
  const c = useThemeColors();
  const [idx, setIdx] = useState(null);
  return (
    <div className="card">
      <h3>{cfg.title}</h3>
      <DataBoundary state={state} validate={validateSim} emptyMessage="This simulation is not available yet.">
        {(sim) => {
          const sc = sim.scenarios;
          const def = Math.max(0, sc.findIndex((s) => Number(s[cfg.v]) === 0));
          const i = Math.min(idx === null ? def : idx, sc.length - 1);
          const cur = sc[i];
          const rows = sc.map((s) => ({ label: String(s[cfg.v]), value: s[cfg.chart] }));
          return (
            <div className="stack">
              <div>
                <div className="small"><b>{cfg.vLabel(cur[cfg.v])}</b></div>
                <input type="range" min={0} max={sc.length - 1} step={1} value={i} onChange={(e) => setIdx(Number(e.target.value))} aria-label={cfg.title} />
              </div>
              <table><tbody>{cfg.out.map(([k, label, f]) => <tr key={k}><td>{label}</td><td className="num">{f === 'p' ? fmtPct(cur[k]) : fmtNum(cur[k])}</td></tr>)}</tbody></table>
              <div className="chart-box" style={{ height: 200 }}>
                <ErrorBoundary>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
                      <XAxis dataKey="label" tick={{ fill: c.text, fontSize: 11 }} />
                      <YAxis tick={{ fill: c.text, fontSize: 11 }} tickFormatter={(v) => fmtNum(v, 1)} />
                      <Tooltip contentStyle={{ background: c.surface, border: '1px solid ' + c.border, borderRadius: 8 }} formatter={(v) => fmtNum(v, 2)} />
                      <Bar dataKey="value" name={cfg.out.find((o) => o[0] === cfg.chart)[1]}>
                        {rows.map((r, n) => <Cell key={r.label} fill={n === i ? c.accent : c.border} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </div>
              <details className="small muted"><summary>Assumptions</summary><ul>{(sim.assumptions || []).map((a) => <li key={a}>{a}</li>)}</ul></details>
            </div>
          );
        }}
      </DataBoundary>
    </div>
  );
}

export function WhatIfSimulator() {
  const cfgs = useMemo(() => SIMS, []);
  return <div className="grid cols-2">{cfgs.map((s) => <SimCard key={s.match} cfg={s} />)}</div>;
}
