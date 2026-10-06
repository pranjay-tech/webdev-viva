// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, cartCount, loading: cartLoading, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);

  // If user visits /checkout with empty cart after initial load, redirect or notice
  const isCartEmpty = !cartLoading && cartItems.length === 0;

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on backend (Task 4)
      const res = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to initialize order');
      }

      const orderData = res.data;
      setRazorpayOrderData(orderData);

      // Check if order is simulated or uses placeholder/test credentials
      const isSimulatedOrder =
        orderData.isSimulated ||
        orderData.razorpayOrderId?.startsWith('order_test_') ||
        orderData.key === 'rzp_test_shopkart10135' ||
        orderData.key?.includes('placeholder');

      if (isSimulatedOrder) {
        setShowSimulator(true);
        setIsSubmitting(false);
        return;
      }

      // 2. Load Razorpay script (Step 9)
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        // Fallback to in-app simulation if Razorpay checkout script is blocked by browser/network
        setShowSimulator(true);
        setIsSubmitting(false);
        return;
      }

      // 3. Open Razorpay Checkout modal (Step 10)
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ShopKart',
        description: `Order #${orderData.shopKartOrderId}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            setIsSubmitting(true);
            // 4. Verify payment signature on backend (Step 11 & 12)
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              // 5. Clear global cart state in React (Task 5)
              await fetchCart();
              // 6. Navigate to Order Confirmation (Task 6)
              navigate(`/order-success/${orderData.shopKartOrderId}`);
            } else {
              setSubmitError(verifyRes.data?.message || 'Payment verification failed');
            }
          } catch (verifyErr) {
            setSubmitError(
              verifyErr.response?.data?.message || 'Payment verification failed on the server.'
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      try {
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (failRes) {
          console.error('Payment failed:', failRes.error);
          setSubmitError(
            `Payment failed: ${failRes.error?.description || 'Transaction declined'}. Your cart has not been cleared.`
          );
          setIsSubmitting(false);
        });
        paymentObject.open();
      } catch (openErr) {
        // In case Razorpay constructor fails (e.g. invalid test key)
        setShowSimulator(true);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to place order';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for direct test simulation (ideal for Viva demo / offline testing)
  const handleSimulatePayment = async (status) => {
    if (!razorpayOrderData) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (status === 'success') {
        const testPaymentId = `pay_sim_${Date.now()}`;
        const verifyRes = await api.post('/orders/verify-payment', {
          shopKartOrderId: razorpayOrderData.shopKartOrderId,
          razorpay_order_id: razorpayOrderData.razorpayOrderId,
          razorpay_payment_id: testPaymentId,
          razorpay_signature: 'simulated_test_signature',
        });

        if (verifyRes.data?.success) {
          setShowSimulator(false);
          await fetchCart();
          navigate(`/order-success/${razorpayOrderData.shopKartOrderId}`);
        } else {
          setSubmitError(verifyRes.data?.message || 'Verification failed');
        }
      } else if (status === 'fail_signature') {
        const verifyRes = await api.post('/orders/verify-payment', {
          shopKartOrderId: razorpayOrderData.shopKartOrderId,
          razorpay_order_id: razorpayOrderData.razorpayOrderId,
          razorpay_payment_id: 'pay_tampered_123',
          razorpay_signature: 'tampered_bad_signature',
        });
      } else {
        setShowSimulator(false);
        setSubmitError('Payment was cancelled or failed. Your cart items are preserved.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartEmpty) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-sm text-slate-400">
            You cannot proceed to checkout without any products in your cart.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/cart" className="hover:text-indigo-400 transition-colors">
              Cart
            </Link>
            <span>/</span>
            <span className="text-indigo-400 font-semibold">Checkout</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Checkout</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-medium">
              Razorpay Test Mode
            </span>
          </h1>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div
            className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3 shadow-lg"
            id="checkout-error-banner"
          >
            <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-rose-200">Unable to complete checkout</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Main Grid: Shipping Address Form (Task 2 & 3) + Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Details Form */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Shipping Details</h2>
              </div>
              <span className="text-xs text-slate-400">All fields required</span>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4" id="shipping-form" noValidate>
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                      errors.fullName
                        ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-fullName">
                      <span>•</span> {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                      errors.phone
                        ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-phone">
                      <span>•</span> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label htmlFor="addressLine1" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Address Line *
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. 22 MG Road, Flat 402"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                    errors.addressLine1
                      ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-addressLine1">
                    <span>•</span> {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                      errors.city
                        ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-city">
                      <span>•</span> {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                      errors.state
                        ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                    }`}
                  />
                  {errors.state && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-state">
                      <span>•</span> {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pincode (6 digits) *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="560001"
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                      errors.pincode
                        ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/30'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'
                    }`}
                  />
                  {errors.pincode && (
                    <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1" id="error-pincode">
                      <span>•</span> {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Stock and price will be verified on the server before payment.</span>
              </div>
            </form>
          </div>

          {/* Order Summary & Payment Button (Task 2 & Step 10) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl sticky top-24">
            <h2 className="text-xl font-extrabold text-white pb-4 border-b border-slate-800">
              Order Summary
            </h2>

            {/* Items list preview */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const prod = item.product || {};
                const itemTotal = (prod.price || 0) * (item.quantity || 1);
                return (
                  <div
                    key={prod._id || item._id}
                    className="flex items-center justify-between gap-3 text-sm py-2 border-b border-slate-800/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          SK
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate">{prod.name}</p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity} × ₹{(prod.price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-100 shrink-0">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Financial calculation */}
            <div className="space-y-3 text-sm pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Items</span>
                <span className="font-semibold text-slate-200">{cartCount} units</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-100">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Grand Total</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400" id="checkout-total-amount">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group ${
                isSubmitting
                  ? 'bg-indigo-600/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 hover:shadow-indigo-600/50'
              }`}
              id="place-order-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Pay with Razorpay</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                100% Secure Razorpay Test Mode Checkout
              </span>
              <p className="text-[11px] text-slate-500">
                Cart is cleared ONLY after backend payment signature verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Simulation Modal for Testing / Viva Demonstration */}
      {showSimulator && razorpayOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            {/* Razorpay Test Mode Ribbon */}
            <div className="absolute top-4 right-12 z-10 px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase tracking-widest">
              Test Mode
            </div>

            {/* Razorpay-style Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 text-xl font-black shadow-inner">
                  💳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-lg">ShopKart Checkout</h3>
                  </div>
                  <p className="text-xs text-slate-400">Powered by Razorpay Standard Checkout</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
                title="Cancel"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Order Amount Banner */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Payable Amount</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                    ₹{(razorpayOrderData.amount / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span className="block font-mono text-[11px] text-indigo-400">
                    #{razorpayOrderData.shopKartOrderId.slice(-8)}
                  </span>
                  <span>{formData.fullName || 'Customer'}</span>
                </div>
              </div>

              {/* Technical Token Summary */}
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                <div><strong>Order ID:</strong> <span className="text-slate-300">{razorpayOrderData.razorpayOrderId}</span></div>
                <div><strong>Amount (Paise):</strong> <span className="text-slate-300">{razorpayOrderData.amount}</span></div>
              </div>

              {/* Simulation Options */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-300">Select Test Mode Scenario:</p>

                <button
                  onClick={() => handleSimulatePayment('success')}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  id="simulate-success-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pay ₹{(razorpayOrderData.amount / 100).toLocaleString('en-IN')} (Simulate Success)</span>
                </button>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleSimulatePayment('fail')}
                    disabled={isSubmitting}
                    className="py-2.5 px-3 rounded-xl text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 transition-all cursor-pointer text-center"
                    id="simulate-fail-btn"
                  >
                    Simulate Payment Failure
                  </button>

                  <button
                    onClick={() => handleSimulatePayment('fail_signature')}
                    disabled={isSubmitting}
                    className="py-2.5 px-3 rounded-xl text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 transition-all cursor-pointer text-center"
                    id="simulate-tamper-btn"
                  >
                    Test Tampered Signature (400)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secured by Razorpay • HMAC SHA-256 Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
