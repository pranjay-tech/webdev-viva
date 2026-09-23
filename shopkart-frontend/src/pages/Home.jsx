// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        const response = await api.get('/customers/me');
        if (isMounted) {
          setCustomer(response.data);
          if (setUser) setUser(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Authentication check failed:', err);
          if (setUser) setUser(null);
          // Automatically redirect to /login if unauthenticated
          navigate('/login');
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUser]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Verifying credentials and loading profile...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/20 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Authenticated Session
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{customer.fullName}!</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base max-w-xl">
                Your ShopKart customer account is active and verified. Here are your account credentials and personal details.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/products"
                className="px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer flex items-center gap-2"
                id="home-browse-products-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Browse Catalog
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-3 rounded-xl font-semibold text-sm text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 shadow-lg shadow-rose-950/40 hover:shadow-rose-900/40 transition-all cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Profile Details
            </h2>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700/50">
              ID: {customer._id || 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Name */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/40 transition-all">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Full Name
              </div>
              <div className="text-lg font-bold text-slate-100 truncate" id="user-fullname">
                {customer.fullName}
              </div>
            </div>

            {/* Email */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/40 transition-all">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Email Address
              </div>
              <div className="text-lg font-bold text-slate-100 truncate" id="user-email">
                {customer.email}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/40 transition-all">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                Phone Number
              </div>
              <div className="text-lg font-bold text-slate-100 truncate" id="user-phone">
                {customer.phone}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}