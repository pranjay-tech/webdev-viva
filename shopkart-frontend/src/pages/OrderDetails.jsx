// src/pages/OrderDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success && res.data.order) {
        setOrder(res.data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      if (err.response?.status === 403) {
        setError('Forbidden: You are not authorized to view this order.');
      } else if (err.response?.status === 404) {
        setError('Order not found in ShopKart.');
      } else {
        setError(err.response?.data?.message || 'Could not load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Bonus progression
  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.data?.success && res.data.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const getStepIndex = (st) => {
    return steps.indexOf(st);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-rose-950/30 border border-rose-800/60 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-rose-200">Unable to view order</h2>
          <p className="text-sm text-rose-300/80">{error || 'Order not found'}</p>
          <Link
            to="/orders"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to My Orders</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Order <span className="font-mono text-indigo-400">#{order._id}</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {order.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ✓ {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Status Progression Stepper (Bonus Challenge) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Order Fulfillment Timeline
            </h2>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 px-1">Progression Demo:</span>
              {steps.map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  disabled={isUpdatingStatus || order.status === st}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    order.status === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {steps.map((st, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={st} className="space-y-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/50'
                        : 'bg-slate-800'
                    }`}
                  />
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isCurrent
                          ? 'text-indigo-400 font-bold'
                          : isCompleted
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Layout: Items Breakdown + Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Purchased (Historical Snapshot) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">
              Purchased Items Snapshot ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-slate-800/80">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        SK
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <span className="font-extrabold text-slate-100 text-sm">
                    ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
              ℹ️ Prices and names reflect the purchase-time snapshot stored in MongoDB.
            </div>
          </div>

          {/* Right Column: Address, Payment Info & Totals */}
          <div className="lg:col-span-5 space-y-6">
            {/* Shipping Address Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white text-sm">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="text-slate-400 pt-1">📞 {order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No address recorded</p>
              )}
            </div>

            {/* Payment & Razorpay Identifiers Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Information
              </h3>
              <div className="text-xs space-y-2 text-slate-300 font-mono">
                <div>
                  <span className="text-slate-400 block font-sans">Payment Status:</span>
                  <span className="text-emerald-400 font-bold">{order.paymentStatus}</span>
                </div>
                {order.razorpayOrderId && (
                  <div>
                    <span className="text-slate-400 block font-sans">Razorpay Order ID:</span>
                    <span className="text-indigo-400 select-all">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div>
                    <span className="text-slate-400 block font-sans">Razorpay Payment ID:</span>
                    <span className="text-indigo-400 select-all">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-xl">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-200">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total Paid</span>
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
