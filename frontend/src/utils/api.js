import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

export const fetchSummary = (filters) => api.get('/summary', { params: filters }).then(r => r.data);
export const fetchCharts = (filters) => api.get('/charts', { params: filters }).then(r => r.data);
export const fetchTransactions = (params) => api.get('/transactions', { params }).then(r => r.data);
export const fetchFilters = () => api.get('/filters').then(r => r.data);
export const placeOrder = (payload) => api.post('/orders', payload).then(r => r.data);
export const exportCSV = (params) => {
  const query = new URLSearchParams(params).toString();
  window.open(`${api.defaults.baseURL}/export?${query}`, '_blank');
};

export default api;
