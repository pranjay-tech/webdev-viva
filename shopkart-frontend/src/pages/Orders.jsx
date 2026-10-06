// src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Bonus Challenge: Update Order Status Progression
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success && res.data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'CONFIRMED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'SHIPPED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PENDING_PAYMENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- STATE 1: LOADING STATE (Task 8) ---
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12" id="orders-loading-state">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-300 font-semibold text-base">Loading your orders...</p>
            <p className="text-slate-500 text-xs mt-1">Fetching order history from server...</p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-48 h-5 bg-slate-800 rounded" />
                  <div className="w-20 h-6 bg-slate-800 rounded-full" />
                </div>
                <div className="h-16 bg-slate-800/40 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 2: ERROR STATE (Task 8) ---
  if (error && orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12" id="orders-error-state">
        <div className="max-w-md w-full bg-rose-950/30 border border-rose-800/60 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-rose-200">Unable to load orders</h2>
          <p className="text-sm text-rose-300/80">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
            id="try-again-orders-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- STATE 3: EMPTY STATE (Task 8) ---
  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12" id="orders-empty-state">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center space-y-5 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl shadow-inner">
            📦
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">No Orders Placed Yet</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              You have not placed any orders yet. Discover our premium products and start shopping!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            id="start-shopping-btn"
          >
            <span>Start Shopping</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // --- STATE 4: MY ORDERS LIST ---
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">My Orders</h1>
              <p className="text-xs text-slate-400 mt-1">
                Showing {orders.length} persistent order{orders.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Orders Stack */}
        <div className="space-y-6">
          {orders.map((order) => {
            const itemCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

            return (
              <div
                key={order._id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl hover:border-slate-700/80 transition-all"
                id={`order-card-${order._id}`}
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Order</span>
                      <span className="font-mono font-bold text-indigo-400 text-sm select-all">
                        #{order._id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {order.status}
                    </span>

                    {/* Payment Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : order.paymentStatus === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {order.paymentStatus === 'PAID' ? '✓ PAID' : order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items Snapshot Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Items ({itemCount} units)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(order.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-xs"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                            SK
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer with Total, Bonus Status progression, and View Details */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-xl font-extrabold text-white">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Bonus Challenge: Quick Status Stepper (Examiner Testing) */}
                    <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[11px] text-slate-400 px-1 font-medium">Status:</span>
                      {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(order._id, st)}
                          disabled={updatingStatusId === order._id || order.status === st}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            order.status === st
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title={`Progress status to ${st}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600/90 hover:bg-indigo-600 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                      id={`view-order-btn-${order._id}`}
                    >
                      <span>View Details</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
