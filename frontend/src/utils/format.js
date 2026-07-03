export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(value);

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
    case 'Refunded': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};
