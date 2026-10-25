import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCharts } from '../../hooks/understand/useCharts.js';
import { useData } from '../../hooks/useData.js';
import { validateChartData } from '../../utils/dataValidator.js';
import { useThemeColors } from '../../hooks/shared/useTheme.js';
import { DataBoundary } from '../shared/DataBoundary.jsx';
import { ErrorBoundary } from '../shared/ErrorBoundary.jsx';
import { EmptyState } from '../shared/EmptyState.jsx';
import { fmtNum, humanize } from '../../utils/formatters.js';

const tipStyle = (c) => ({ background: c.surface, border: '1px solid ' + c.border, borderRadius: 8 });
const tipFmt = (v) => (typeof v === 'number' ? fmtNum(v, 2) : v);

export function renderChart(chart, c) {
  const rows = chart.data;
  const tick = { fill: c.text, fontSize: 12 };
  const margin = { top: 10, right: 20, bottom: 24, left: 10 };
  const keys = Object.keys(rows[0]).filter((k) => !['label', 'x', 'y'].includes(k) && typeof rows[0][k] === 'number');
  if (chart.type === 'scatter') {
    const xs = rows.map((r) => r.x);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis type="number" dataKey="x" name={chart.x_label} domain={['auto', 'auto']} tick={tick} tickFormatter={(v) => fmtNum(v, 1)} />
          <YAxis type="number" dataKey="y" name={chart.y_label} domain={['auto', 'auto']} tick={tick} tickFormatter={(v) => fmtNum(v, 1)} />
          <Tooltip contentStyle={tipStyle(c)} cursor={{ strokeDasharray: '3 3' }} formatter={tipFmt} />
          <Scatter data={rows} fill={c.accent} />
          {Number.isFinite(chart.trend_slope) && Number.isFinite(chart.trend_intercept) && (
            <ReferenceLine stroke={c.danger} strokeDasharray="4 4"
              segment={[{ x: x0, y: chart.trend_slope * x0 + chart.trend_intercept }, { x: x1, y: chart.trend_slope * x1 + chart.trend_intercept }]} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }
  if (keys.length === 0) return <EmptyState message="This chart has no numeric series." />;
  if (chart.type === 'bar') {
    const horizontal = rows.some((r) => String(r.label).length > 12);
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={rows} layout={horizontal ? 'vertical' : 'horizontal'} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          {horizontal
            ? [<YAxis key="y" type="category" dataKey="label" width={170} tick={{ ...tick, fontSize: 11 }} tickFormatter={humanize} />, <XAxis key="x" type="number" tick={tick} tickFormatter={(v) => fmtNum(v, 1)} />]
            : [<XAxis key="x" dataKey="label" tick={tick} />, <YAxis key="y" tick={tick} tickFormatter={(v) => fmtNum(v, 1)} domain={['auto', 'auto']} />]}
          <Tooltip contentStyle={tipStyle(c)} formatter={tipFmt} />
          {keys.map((k, i) => <Bar key={k} dataKey={k} name={humanize(k)} fill={c.series[i % c.series.length]} radius={[4, 4, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  }
  if (chart.type === 'line') {
    const mx = keys.map((k) => Math.max(...rows.map((r) => Math.abs(Number(r[k]) || 0))) || 1);
    const dual = keys.length === 2 && (mx[0] / mx[1] > 20 || mx[1] / mx[0] > 20);
    const rightKey = dual ? (mx[0] < mx[1] ? keys[0] : keys[1]) : null;
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={rows} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} />
          <XAxis dataKey="label" tick={tick} minTickGap={48} />
          <YAxis yAxisId="l" tick={tick} tickFormatter={(v) => fmtNum(v, 1)} domain={['auto', 'auto']} />
          {dual && <YAxis yAxisId="r" orientation="right" tick={tick} tickFormatter={(v) => fmtNum(v, 1)} domain={['auto', 'auto']} />}
          <Tooltip contentStyle={tipStyle(c)} formatter={tipFmt} />
          <Legend />
          {keys.map((k, i) => <Line key={k} yAxisId={k === rightKey ? 'r' : 'l'} type="monotone" dataKey={k} name={humanize(k)} stroke={c.series[i % c.series.length]} strokeWidth={2} dot={false} isAnimationActive={false} />)}
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return <EmptyState message={'Unsupported chart type: ' + chart.type} />;
}

function ChartCard({ path }) {
  const state = useData(path);
  const c = useThemeColors();
  return (
    <div className="card">
      <DataBoundary state={state} validate={validateChartData} emptyMessage="This chart is not available yet.">
        {(chart) => (
          <>
            <h3>{chart.question || chart.title}</h3>
            <div className="tiny muted" style={{ marginBottom: 8 }}>{chart.outcome}{chart.note ? ' \u00B7 ' + chart.note : ''}</div>
            <div className="chart-box"><ErrorBoundary>{renderChart(chart, c)}</ErrorBoundary></div>
          </>
        )}
      </DataBoundary>
    </div>
  );
}

export function ChartPanel() {
  const paths = useCharts();
  if (!paths.length) return <EmptyState message="No charts available yet." action="Run the pipeline, then python export_for_frontend.py, then npm run build." />;
  return <div className="grid cols-2">{paths.map((p) => <ChartCard key={p} path={p} />)}</div>;
}
