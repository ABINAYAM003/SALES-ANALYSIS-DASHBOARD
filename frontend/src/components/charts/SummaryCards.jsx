import React from 'react';
import { TrendingUp, ShoppingCart, Users, DollarSign, Tag, MapPin } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/format';

const MetricCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <div className="card p-5 flex items-start gap-4 hover:shadow-card-hover transition-shadow duration-200">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {loading ? (
        <div className="skeleton h-7 w-28 rounded mb-1" />
      ) : (
        <p className="text-2xl font-700 text-gray-900 leading-tight">{value}</p>
      )}
      {sub && !loading && (
        <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
      )}
    </div>
  </div>
);

export default function SummaryCards({ data, loading }) {
  const metrics = [
    {
      icon: DollarSign, label: 'Total Revenue',
      value: data ? formatCurrency(data.totalRevenue) : '—',
      sub: 'Completed orders only',
      color: 'bg-brand-600',
    },
    {
      icon: ShoppingCart, label: 'Total Orders',
      value: data ? formatNumber(data.totalOrders) : '—',
      sub: 'All statuses',
      color: 'bg-emerald-500',
    },
    {
      icon: TrendingUp, label: 'Avg Order Value',
      value: data ? formatCurrency(data.avgOrderValue) : '—',
      sub: 'Per completed transaction',
      color: 'bg-amber-500',
    },
    {
      icon: Users, label: 'Total Customers',
      value: data ? formatNumber(data.totalCustomers) : '—',
      sub: 'Unique buyers',
      color: 'bg-violet-500',
    },
    {
      icon: Tag, label: 'Top Category',
      value: data ? data.topCategory : '—',
      sub: 'By revenue',
      color: 'bg-rose-500',
    },
    {
      icon: MapPin, label: 'Best Region',
      value: data ? data.topRegion : '—',
      sub: 'Highest sales volume',
      color: 'bg-cyan-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m, i) => (
        <MetricCard key={i} {...m} loading={loading} />
      ))}
    </div>
  );
}
