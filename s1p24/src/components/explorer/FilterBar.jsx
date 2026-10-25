import { useCrossFilter } from './CrossFilterContext.jsx';

export function FilterBar({ segments, minDate, maxDate }) {
  const { filters, setFilter, clearFilters, activeFilters } = useCrossFilter();
  return (
    <div className="filterbar">
      <label>From<input type="date" min={minDate} max={maxDate} value={filters.from || ''} onChange={(e) => setFilter('from', e.target.value)} /></label>
      <label>To<input type="date" min={minDate} max={maxDate} value={filters.to || ''} onChange={(e) => setFilter('to', e.target.value)} /></label>
      <label>Week type
        <select value={filters.segment || 'all'} onChange={(e) => setFilter('segment', e.target.value)}>
          <option value="all">All</option>
          {segments.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>Unusual weeks
        <select value={filters.anomaly || 'all'} onChange={(e) => setFilter('anomaly', e.target.value)}>
          <option value="all">All weeks</option><option value="yes">Only unusual</option><option value="no">Hide unusual</option>
        </select>
      </label>
      <button className="btn ghost" onClick={clearFilters} disabled={!activeFilters}>Clear filters{activeFilters ? ' (' + activeFilters + ')' : ''}</button>
    </div>
  );
}
