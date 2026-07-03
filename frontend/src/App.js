import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AppShell from './components/layout/AppShell';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import Dashboard from './pages/Dashboard';
import { CartProvider } from './context/CartContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

export default function App() {
  const [view, setView] = useState('catalog');
  const [justOrdered, setJustOrdered] = useState(false);

  const handleOrderSuccess = () => {
    setJustOrdered(true);
    setView('dashboard');
    setTimeout(() => setJustOrdered(false), 100);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <AppShell view={view} setView={setView}>
            {view === 'catalog' && (
              <CatalogPage onGoToCart={() => setView('cart')} />
            )}
            {view === 'cart' && (
              <CartPage
                onContinue={() => setView('catalog')}
                onDashboard={handleOrderSuccess}
              />
            )}
            {view === 'dashboard' && (
              <Dashboard justOrdered={justOrdered} />
            )}
          </AppShell>
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
