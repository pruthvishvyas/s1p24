import { useState } from 'react';
import { useGoals } from '../../hooks/decide/useGoals.js';
import { validateGoals } from '../../utils/dataValidator.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { humanize } from '../../utils/formatters.js';

const KEY = 'goal_overrides';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };

export function GoalTracker() {
  const state = useGoals();
  const [over, setOver] = useState(load);
  const set = (k, v) => {
    const next = { ...over, [k]: v };
    if (v === '') delete next[k];
    setOver(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
  };
  return (
    <DataBoundary state={state} validate={validateGoals} emptyMessage="No goals available yet.">
      {(goals) => (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Goal</th><th className="num">Pipeline value</th><th>Unit</th><th>Your target</th></tr></thead>
            <tbody>
              {Object.entries(goals).map(([k, g]) => (
                <tr key={k}>
                  <td>{humanize(k)}{g.description ? <div className="tiny muted">{g.description}</div> : null}</td>
                  <td className="num">{g.value === null || g.value === undefined ? 'not set' : g.value}</td>
                  <td>{g.unit}</td>
                  <td>{g.client_sets ? <input type="number" value={over[k] === undefined ? '' : over[k]} placeholder="type a target" onChange={(e) => set(k, e.target.value)} /> : <span className="muted">fixed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tiny muted">Targets you type are saved in this browser only. To change them for everyone, edit config/goals.json and run the pipeline export again.</p>
        </div>
      )}
    </DataBoundary>
  );
}
