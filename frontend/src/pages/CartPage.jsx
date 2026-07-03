import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, User, MapPin, CheckCircle2, Package, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { REGIONS } from '../data/products';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CartItem({ item, onRemove, onQty }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 group">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
        {item.image}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        <p className="text-sm font-bold text-indigo-600 mt-1">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => onQty(item.id, item.qty - 1)} disabled={item.qty <= 1}
            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <Minus size={12} />
          </button>
          <span className="w-7 text-center text-sm font-semibold text-gray-800">{item.qty}</span>
          <button onClick={() => onQty(item.id, item.qty + 1)}
            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors">
            <Plus size={12} />
          </button>
        </div>
        <button onClick={() => onRemove(item.id)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function OrderSuccess({ orderCount, onContinue, onDashboard }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 animate-bounce">
        <CheckCircle2 size={40} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
      <p className="text-gray-500 mb-2 text-sm">
        {orderCount} transaction{orderCount > 1 ? 's' : ''} added to the dashboard
      </p>
      <p className="text-xs text-indigo-400 bg-indigo-50 px-4 py-2 rounded-full mb-8 font-medium">
        🎉 Your sales data has been updated in real-time
      </p>
      <div className="flex gap-3">
        <button onClick={onContinue}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-colors">
          <ShoppingBag size={16} /> Continue Shopping
        </button>
        <button onClick={onDashboard}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
          View Dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function CartPage({ onContinue, onDashboard }) {
  const { items, removeFromCart, updateQty, clearCart, totalAmount } = useCart();
  const [form, setForm] = useState({ name: '', region: '', coupon: '' });
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [error, setError] = useState('');

  const discount = couponApplied ? Math.round(totalAmount * 0.1) : 0;
  const tax = Math.round((totalAmount - discount) * 0.18);
  const finalTotal = totalAmount - discount + tax;

  const handleCoupon = () => {
    if (form.coupon.toUpperCase() === 'SAVE10') {
      setCouponApplied(true);
    } else {
      setError('Invalid coupon code. Try SAVE10');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleCheckout = async () => {
    if (!form.name.trim()) { setError('Please enter customer name'); return; }
    if (!form.region) { setError('Please select a region'); return; }
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/orders`, {
        customerName: form.name.trim(),
        region: form.region,
        items: items.map(i => ({
          productName: i.name,
          category: i.category,
          amount: i.price * i.qty,
          qty: i.qty,
        })),
      });
      setOrderCount(items.length);
      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to place order. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <OrderSuccess orderCount={orderCount} onContinue={onContinue} onDashboard={onDashboard} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
          <ShoppingBag size={40} className="text-indigo-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Browse the catalog and add some products!</p>
        <button onClick={onContinue}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-colors">
          <ShoppingBag size={16} /> Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ShoppingBag size={18} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-sm text-gray-400">{items.length} product{items.length > 1 ? 's' : ''} · {items.reduce((s, i) => s + i.qty, 0)} items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Package size={14} className="text-indigo-400" /> Order Items
            </h2>
            <div className="divide-y divide-gray-50">
              {items.map(item => (
                <CartItem key={item.id} item={item} onRemove={removeFromCart} onQty={updateQty} />
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} className="text-indigo-400" /> Customer Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Customer Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Region <span className="text-red-400">*</span></label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={form.region}
                    onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                    className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Tag size={14} className="text-indigo-400" /> Coupon Code
            </h2>
            {couponApplied ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
                <CheckCircle2 size={16} />
                SAVE10 applied — 10% off!
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try: SAVE10"
                  value={form.coupon}
                  onChange={e => setForm(f => ({ ...f, coupon: e.target.value }))}
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                <button onClick={handleCoupon}
                  className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 leading-snug flex-1">{item.name} × {item.qty}</span>
                  <span className="text-gray-700 font-medium shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-100 pt-2.5 mt-1">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount (10%)</span>
                    <span>−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2.5 mt-2">
                  <span>Total</span>
                  <span className="text-indigo-700">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <>Place Order <ArrowRight size={16} /></>}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">Secure checkout · No payment required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
