import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Star, Filter, SlidersHorizontal, ChevronDown, Plus, Check, Zap } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={11}
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onAdd, inCart, qty }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const categoryColors = {
    Electronics: 'bg-blue-50 text-blue-600',
    Clothing: 'bg-purple-50 text-purple-600',
    'Home & Garden': 'bg-emerald-50 text-emerald-600',
    Sports: 'bg-orange-50 text-orange-600',
    Books: 'bg-yellow-50 text-yellow-700',
    Beauty: 'bg-pink-50 text-pink-600',
    'Food & Beverage': 'bg-lime-50 text-lime-700',
    Automotive: 'bg-slate-50 text-slate-600',
  };

  const badgeColors = {
    'Best Seller': 'bg-amber-500 text-white',
    'Top Rated': 'bg-indigo-600 text-white',
    'New': 'bg-emerald-500 text-white',
    'Classic': 'bg-slate-500 text-white',
    'Premium': 'bg-violet-600 text-white',
    'Popular': 'bg-rose-500 text-white',
    '#1 Bestseller': 'bg-amber-600 text-white',
    'Organic': 'bg-green-600 text-white',
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
      {/* Product Image Area */}
      <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50/30 h-44 flex items-center justify-center">
        <span className="text-6xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
          {product.image}
        </span>
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[product.badge] || 'bg-gray-700 text-white'}`}>
            {product.badge}
          </span>
        )}
        {inCart && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-md">
            <ShoppingCart size={11} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[product.category] || 'bg-gray-100 text-gray-600'}`}>
            {product.category}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-indigo-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed flex-1">{product.description}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-end justify-between gap-2 mt-auto">
          <div>
            <p className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
            {inCart && <p className="text-[10px] text-indigo-600 font-medium">{qty} in cart</p>}
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm
              ${added
                ? 'bg-emerald-500 text-white scale-95'
                : inCart
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
          >
            {added ? <Check size={13} /> : <Plus size={13} />}
            {added ? 'Added!' : inCart ? 'Add more' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage({ onGoToCart }) {
  const { addToCart, items } = useCart();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [maxPrice, setMaxPrice] = useState(200000);

  const cartMap = useMemo(() => {
    const m = {};
    items.forEach(i => { m[i.id] = i.qty; });
    return m;
  }, [items]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      return matchCat && matchSearch && matchPrice;
    });

    switch (sort) {
      case 'price_asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'reviews': list = [...list].sort((a, b) => b.reviews - a.reviews); break;
      default: break;
    }
    return list;
  }, [search, selectedCategory, sort, maxPrice]);

  const totalCartItems = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-white rounded-full translate-y-1/2" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">Sales Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Browse Products</h1>
            <p className="text-indigo-200 text-sm">{PRODUCTS.length} products across {CATEGORIES.length - 1} categories</p>
          </div>
          {totalCartItems > 0 && (
            <button
              onClick={onGoToCart}
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shrink-0"
            >
              <ShoppingCart size={16} />
              View Cart ({totalCartItems})
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Category</p>
            </div>
            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const count = cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all
                      ${selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                  >
                    <span>{cat}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Max Price</p>
            </div>
            <div className="space-y-3">
              <input
                type="range" min={499} max={200000} step={500}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>₹499</span>
                <span className="font-semibold text-indigo-700">₹{maxPrice.toLocaleString('en-IN')}</span>
                <span>₹2L</span>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Sort By</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all
                    ${sort === opt.value
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && <span> in <span className="text-indigo-600 font-medium">{selectedCategory}</span></span>}
            </p>
            {(search || selectedCategory !== 'All' || sort !== 'default') && (
              <button onClick={() => { setSearch(''); setSelectedCategory('All'); setSort('default'); setMaxPrice(200000); }}
                className="text-xs text-indigo-600 hover:underline">
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <span className="text-5xl mb-4 block">🔍</span>
              <p className="font-semibold text-gray-700 mb-1">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addToCart}
                  inCart={!!cartMap[product.id]}
                  qty={cartMap[product.id] || 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
