import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

export default function FiltersBar({ filters, setFilters, filterOptions, onReset }) {
  const update = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Filter size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <Calendar size={14} className="text-gray-400" />
          <input type="date" value={filters.startDate || ''} onChange={e => update('startDate', e.target.value)}
            className="bg-transparent text-sm text-gray-700 focus:outline-none w-32" />
          <span className="text-gray-300 text-xs">to</span>
          <input type="date" value={filters.endDate || ''} onChange={e => update('endDate', e.target.value)}
            className="bg-transparent text-sm text-gray-700 focus:outline-none w-32" />
        </div>

        <select value={filters.category || 'all'} onChange={e => update('category', e.target.value)}
          className="input-field w-44 py-1.5 text-sm">
          <option value="all">All Categories</option>
          {(filterOptions?.categories || []).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={filters.region || 'all'} onChange={e => update('region', e.target.value)}
          className="input-field w-40 py-1.5 text-sm">
          <option value="all">All Regions</option>
          {(filterOptions?.regions || []).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button onClick={onReset}
          className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50">
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  );
}
