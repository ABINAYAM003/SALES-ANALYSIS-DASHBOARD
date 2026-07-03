import React from 'react';
import { BarChart2, ShoppingBag, ShoppingCart, LayoutDashboard, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const NAV = [
  { key: 'catalog', icon: ShoppingBag, label: 'Products', sub: 'Browse & add to cart' },
  { key: 'cart', icon: ShoppingCart, label: 'Cart', sub: 'Review & checkout' },
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: 'Sales analytics' },
];

export default function AppShell({ view, setView, children }) {
  const { totalItems, totalAmount } = useCart();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md">
              <Sparkles size={17} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none tracking-tight">SalesIQ</p>
              <p className="text-[10px] text-indigo-400 font-medium mt-0.5">Sales Intelligence Platform</p>
            </div>
          </div>

          {/* Nav Pills */}
          <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {NAV.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${view === key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'}`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                {key === 'cart' && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Cart summary pill */}
          <button
            onClick={() => setView('cart')}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200
              ${totalItems > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                : 'bg-white border-gray-200 text-gray-400 cursor-default'}`}
          >
            <ShoppingCart size={15} />
            {totalItems > 0 ? (
              <span>{totalItems} item{totalItems > 1 ? 's' : ''} · ₹{totalAmount.toLocaleString('en-IN')}</span>
            ) : (
              <span>Cart empty</span>
            )}
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
