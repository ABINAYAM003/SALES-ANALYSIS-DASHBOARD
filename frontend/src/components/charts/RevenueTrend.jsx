import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.name === 'Revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function RevenueTrendChart({ data, loading }) {
  if (loading) return (
    <div className="card p-5">
      <div className="skeleton h-5 w-40 rounded mb-4" />
      <div className="skeleton h-52 rounded" />
    </div>
  );

  const formatted = (data || []).map(d => ({
    ...d,
    month: d.month?.slice(0, 7),
    revenue: parseFloat(d.revenue),
    orders: parseInt(d.orders),
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5}
            fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
