// src/pages/Wishlist.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/wishlist');
      if (response.data?.success && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      } else if (Array.isArray(response.data)) {
        setWishlist(response.data);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status === 401) {
        navigate('/login', {
          state: { message: 'Please log in to view your saved wishlist items.' },
        });
        return;
      }
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveProduct = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data?.success || res.status === 200) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        setFeedback('Product removed from your wishlist.');
        window.dispatchEvent(
          new CustomEvent('wishlist-updated', {
            detail: { productId, added: false },
          })
        );
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to remove product:', err);
      setFeedback(err.response?.data?.message || 'Failed to remove product from wishlist.');
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                My Wishlist
              </h1>
            </div>
            {!loading && !error && (
              <p className="text-slate-400 text-sm mt-2">
                <span className="font-semibold text-rose-400">{wishlist.length}</span>{' '}
                {wishlist.length === 1 ? 'product saved' : 'products saved'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              id="continue-shopping-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Temporary Notification Banner */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-indigo-300 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-lg">
            <span>✨</span>
            <span>{feedback}</span>
          </div>
        )}

        {/* --- UI STATE 1: LOADING STATE (Task 7, Section 10) --- */}
        {loading && (
          <div className="space-y-6" id="wishlist-loading-state">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-200 font-semibold text-base">Loading your wishlist...</p>
              <p className="text-slate-500 text-xs mt-1">Retrieving your saved items from the server...</p>
            </div>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-60">
              {[1, 2, 3, 4].map((n) => (
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

        {/* --- UI STATE 2: ERROR STATE (Task 7, Section 11) --- */}
        {!loading && error && (
          <div
            className="bg-rose-950/30 border border-rose-800/60 rounded-3xl p-10 md:p-14 text-center max-w-lg mx-auto shadow-2xl space-y-4"
            id="wishlist-error-state"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-rose-200">Something went wrong.</h2>
            <p className="text-sm text-rose-300/80">{error}</p>
            <button
              onClick={fetchWishlist}
              className="mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
              id="try-again-btn"
            >
              Try Again
            </button>
          </div>
        )}

        {/* --- UI STATE 3: EMPTY STATE (Task 7, Section 9) --- */}
        {!loading && !error && wishlist.length === 0 && (
          <div
            className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 md:p-16 text-center max-w-lg mx-auto shadow-2xl space-y-5"
            id="wishlist-empty-state"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 text-3xl shadow-inner">
              ❤️
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-100">
                Your wishlist is empty ❤️
              </h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Save products you love and find them here later.
              </p>
            </div>
            <div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                id="browse-products-btn"
              >
                <span>Browse Products</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* --- DYNAMIC WISHLIST GRID (Task 6, Section 6) --- */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
