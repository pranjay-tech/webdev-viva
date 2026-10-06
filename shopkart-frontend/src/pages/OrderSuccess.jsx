// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data?.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-16">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        {/* Animated Checkmark Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 relative">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" id="order-success-title">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Your payment has been verified and your order has been saved successfully in ShopKart.
            </p>
          </div>

          {/* Order Details Badge Grid */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Order ID</span>
              <span className="font-mono font-bold text-indigo-400 select-all" id="confirmed-order-id">
                {order?._id || id}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" id="confirmed-order-status">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {order?.status || 'PLACED'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Payment Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ✓ {order?.paymentStatus || 'PAID'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Total Amount</span>
              <span className="text-base font-extrabold text-white" id="confirmed-order-total">
                ₹{order?.totalAmount?.toLocaleString('en-IN') || '0'}
              </span>
            </div>

            {order?.shippingAddress && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block mb-1">Shipping To</span>
                <p className="text-slate-200">
                  <strong>{order.shippingAddress.fullName}</strong> — {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              id="view-my-orders-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>View My Orders</span>
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              id="continue-shopping-btn"
            >
              <span>Continue Shopping</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
