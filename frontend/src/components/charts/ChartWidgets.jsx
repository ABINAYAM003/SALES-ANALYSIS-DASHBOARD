import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/format';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const ChartSkeleton = () => (
  <div className="card p-5">
    <div className="skeleton h-5 w-36 rounded mb-4" />
    <div className="skeleton h-48 rounded" />
  </div>
);

export function CategoryChart({ data, loading }) {
  if (loading) return <ChartSkeleton />;
  const formatted = (data || []).map(d => ({ ...d, revenue: parseFloat(d.revenue) }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Category</h3>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={formatted} layout="vertical" margin={{ left: 60, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
            {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RegionChart({ data, loading }) {
  if (loading) return <ChartSkeleton />;
  const formatted = (data || []).map(d => ({ ...d, revenue: parseFloat(d.revenue) }));
  
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Region</h3>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie data={formatted} dataKey="revenue" nameKey="region" cx="50%" cy="50%"
            outerRadius={80} innerRadius={45} paddingAngle={3}>
            {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusChart({ data, loading }) {
  if (loading) return <ChartSkeleton />;
  const statusColors = { Completed: '#10b981', Pending: '#f59e0b', Cancelled: '#ef4444', Refunded: '#8b5cf6' };
  const formatted = (data || []).map(d => ({ ...d, count: parseInt(d.count), fill: statusColors[d.status] || '#94a3b8' }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
          <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
            {formatted.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
