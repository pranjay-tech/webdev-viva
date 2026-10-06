// src/components/Navbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, fetchCart } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlistCount = useCallback(async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await api.get('/wishlist/count');
      if (res.data?.success && typeof res.data.count === 'number') {
        setWishlistCount(res.data.count);
      }
    } catch (err) {
      // silence
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistCount();

    const handleWishlistUpdated = () => fetchWishlistCount();
    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [fetchWishlistCount]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('shopkart_token');
      if (setUser) setUser(null);
      setWishlistCount(0);
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand */}
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Shop<span className="text-indigo-400">Kart</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            to="/home"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/home')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/products') || location.pathname.startsWith('/products/')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            id="nav-products-link"
          >
            Products
          </Link>

          {/* Wishlist link with backend count (Lab 04 Bonus) */}
          <Link
            to="/wishlist"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/wishlist')
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            id="nav-wishlist-link"
          >
            <span>Wishlist</span>
            {user && (
              <span className="px-1.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40" id="wishlist-badge">
                ({wishlistCount})
              </span>
            )}
          </Link>

          {/* Cart link with global CartContext count (Lab 05 Task 16) */}
          <Link
            to="/cart"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              isActive('/cart')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            id="nav-cart-link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cart</span>
            {user && (
              <span
                className={`px-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  cartCount > 0
                    ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
                }`}
                id="cart-badge"
              >
                ({cartCount})
              </span>
            )}
          </Link>

          {/* My Orders link (Lab 06 Task 8) */}
          {user && (
            <Link
              to="/orders"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/orders') || location.pathname.startsWith('/orders/')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
              id="nav-orders-link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>My Orders</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 ml-1">
              <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                👤 {user.fullName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                id="logout-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/login"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/login')
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
