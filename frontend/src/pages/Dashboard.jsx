import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import SummaryCards from '../components/charts/SummaryCards';
import RevenueTrendChart from '../components/charts/RevenueTrend';
import { CategoryChart, RegionChart, StatusChart } from '../components/charts/ChartWidgets';
import FiltersBar from '../components/filters/FiltersBar';
import TransactionsTable from '../components/table/TransactionsTable';
import { fetchSummary, fetchCharts, fetchTransactions, fetchFilters } from '../utils/api';

const DEFAULT_FILTERS = { startDate: '', endDate: '', category: 'all', region: 'all' };
const DEFAULT_TABLE = { page: 1, limit: 20, sortBy: 'transaction_date', sortOrder: 'DESC', search: '' };

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Dashboard({ justOrdered }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tableParams, setTableParams] = useState(DEFAULT_TABLE);
  const [showBanner, setShowBanner] = useState(false);
  const debouncedSearch = useDebounce(tableParams.search, 400);
  const queryClient = useQueryClient();

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v && v !== 'all')
  );

  useEffect(() => {
    if (justOrdered) {
      setShowBanner(true);
      queryClient.invalidateQueries();
      const t = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [justOrdered, queryClient]);

  const { data: filterOptions } = useQuery({
    queryKey: ['filters'],
    queryFn: fetchFilters,
    staleTime: Infinity,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['summary', cleanFilters],
    queryFn: () => fetchSummary(cleanFilters),
  });

  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ['charts', cleanFilters],
    queryFn: () => fetchCharts(cleanFilters),
  });

  const { data: transactions, isLoading: txLoading, isError: txError } = useQuery({
    queryKey: ['transactions', cleanFilters, tableParams.page, tableParams.limit,
      tableParams.sortBy, tableParams.sortOrder, debouncedSearch],
    queryFn: () => fetchTransactions({
      ...cleanFilters,
      page: tableParams.page,
      limit: tableParams.limit,
      sortBy: tableParams.sortBy,
      sortOrder: tableParams.sortOrder,
      search: debouncedSearch,
    }),
    keepPreviousData: true,
  });

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setTableParams(DEFAULT_TABLE);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sales Analytics</h1>
            <p className="text-sm text-gray-400">
              {transactions?.pagination?.total?.toLocaleString() || '—'} total records
              <span className="inline-flex items-center gap-1 ml-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                <span className="text-emerald-500 text-xs">Live</span>
              </span>
            </p>
          </div>
        </div>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-indigo-300 transition-all">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* New orders banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg shadow-emerald-200 animate-pulse-once">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">Dashboard updated with your new orders!</p>
            <p className="text-emerald-100 text-xs">New transactions are now reflected in all charts and metrics below.</p>
          </div>
          <button onClick={() => setShowBanner(false)}
            className="ml-auto text-white/70 hover:text-white text-lg leading-none shrink-0">×</button>
        </div>
      )}

      {/* Filters */}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        onReset={handleReset}
      />

      {/* Summary Cards */}
      <SummaryCards data={summary} loading={summaryLoading} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={charts?.revenueTrend} loading={chartsLoading} />
        </div>
        <StatusChart data={charts?.byStatus} loading={chartsLoading} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart data={charts?.byCategory} loading={chartsLoading} />
        <RegionChart data={charts?.byRegion} loading={chartsLoading} />
      </div>

      {/* Transactions Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">All Transactions</h2>
        </div>
        <TransactionsTable
          tableParams={{ ...tableParams, search: debouncedSearch }}
          setTableParams={setTableParams}
          data={transactions}
          loading={txLoading}
          error={txError ? 'Unable to load transactions. Please try again.' : null}
        />
      </div>
    </div>
  );
}
