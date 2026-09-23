// src/pages/Products.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const response = await api.get('/products', { params });
      if (response.data?.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    // Add a slight debounce for search typing to reduce unnecessary rapid queries
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Banner Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/60 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              ✨ Discover ShopKart
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Explore Our <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Curated Catalog</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base leading-relaxed">
              Find premium electronics, stylish apparel, best-selling books, and home essentials with real-time stock and instant search.
            </p>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
        />

        {/* Results Meta Info */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
              {category && <span> in <strong className="text-indigo-400">{category}</strong></span>}
              {search && <span> matching "<strong className="text-indigo-400">{search}</strong>"</span>}
            </span>
            {(search || category || sort) && (
              <button
                onClick={handleResetFilters}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* --- UI STATE 1: LOADING STATE --- */}
        {loading && (
          <div className="space-y-6" id="products-loading-state">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-300 font-medium text-base">Loading products...</p>
              <p className="text-slate-500 text-xs mt-1">Connecting to catalog database...</p>
            </div>

            {/* Skeleton Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-60">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 animate-pulse space-y-4">
                  <div className="aspect-4/3 bg-slate-800/80 rounded-xl" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                  <div className="h-8 bg-slate-800/80 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- UI STATE 2: ERROR STATE --- */}
        {!loading && error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-4" id="products-error-state">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-rose-200">Something went wrong while loading products.</h2>
            <p className="text-sm text-rose-300/80">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* --- UI STATE 3: EMPTY STATE --- */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 md:p-16 text-center max-w-lg mx-auto shadow-xl space-y-4" id="products-empty-state">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">No products found.</h2>
            <p className="text-sm text-slate-400">
              We couldn't find any products matching your search criteria. Try modifying your search keywords or switching categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* --- DYNAMIC PRODUCT GRID --- */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
