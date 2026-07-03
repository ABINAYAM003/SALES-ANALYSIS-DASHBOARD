import React, { useState } from 'react';
import { Search, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, InboxIcon } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/format';
import { exportCSV } from '../../utils/api';

const COLUMNS = [
  { key: 'transaction_id', label: 'Txn ID', sortable: true },
  { key: 'customer_name', label: 'Customer', sortable: true },
  { key: 'product_name', label: 'Product', sortable: false },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'region', label: 'Region', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'transaction_date', label: 'Date', sortable: true },
];

const SkeletonRow = () => (
  <tr>
    {COLUMNS.map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

export default function TransactionsTable({ tableParams, setTableParams, data, loading, error }) {
  const { page, limit, sortBy, sortOrder, search } = tableParams;

  const handleSort = (key) => {
    if (!COLUMNS.find(c => c.key === key)?.sortable) return;
    setTableParams(p => ({
      ...p, page: 1,
      sortBy: key,
      sortOrder: p.sortBy === key && p.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown size={13} className="text-gray-300" />;
    return sortOrder === 'ASC' ? <ChevronUp size={13} className="text-brand-500" /> : <ChevronDown size={13} className="text-brand-500" />;
  };

  const pagination = data?.pagination;
  const rows = data?.data || [];

  return (
    <div className="card overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex-1 relative min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, product, ID…"
            value={search}
            onChange={e => setTableParams(p => ({ ...p, search: e.target.value, page: 1 }))}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <select value={limit} onChange={e => setTableParams(p => ({ ...p, limit: parseInt(e.target.value), page: 1 }))}
          className="input-field w-28 py-2 text-sm">
          {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button
          onClick={() => exportCSV({ ...tableParams })}
          className="btn-primary text-sm">
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {COLUMNS.map(col => (
                <th key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
                    ${col.sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''}`}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: limit > 10 ? 10 : limit }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-red-400">
                    <AlertCircle size={32} />
                    <p className="font-medium text-sm">Failed to load transactions</p>
                    <p className="text-xs text-gray-400">{error}</p>
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <InboxIcon size={32} />
                    <p className="font-medium text-sm">No transactions found</p>
                    <p className="text-xs">Try adjusting your filters or search query</p>
                  </div>
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={row.transaction_id} className={`hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-600 font-medium">{row.transaction_id}</td>
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{row.customer_name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-40 truncate">{row.product_name}</td>
                <td className="px-4 py-3 text-gray-500">{row.category}</td>
                <td className="px-4 py-3 text-gray-500">{row.region}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{formatCurrency(row.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(row.transaction_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-gray-500">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total.toLocaleString()} records
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setTableParams(p => ({ ...p, page: 1 }))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              «
            </button>
            <button onClick={() => setTableParams(p => ({ ...p, page: p.page - 1 }))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button key={pageNum} onClick={() => setTableParams(p => ({ ...p, page: pageNum }))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                    ${pageNum === page ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setTableParams(p => ({ ...p, page: p.page + 1 }))} disabled={page === pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight size={15} />
            </button>
            <button onClick={() => setTableParams(p => ({ ...p, page: pagination.totalPages }))} disabled={page === pagination.totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
