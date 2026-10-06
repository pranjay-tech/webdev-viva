// src/components/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, itemLoaders } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const isOutOfStock = product.stock <= 0;
  const cartQty = getItemQuantity(product._id);
  const isAddingToCart = itemLoaders[product._id] === 'adding';

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg({ text: '', type: '' });
    }, 3000);
  };

  // Toggle Wishlist
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        showFeedback('Removed from Wishlist', 'info');
        if (onWishlistChange) onWishlistChange(product._id, false);
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: product._id, added: false } }));
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        showFeedback('♥ Added to Wishlist', 'success');
        if (onWishlistChange) onWishlistChange(product._id, true);
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: product._id, added: true } }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { message: 'Please log in to manage your wishlist' } });
        return;
      }
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        showFeedback('Already in Wishlist', 'info');
      } else {
        showFeedback(err.response?.data?.message || 'Unable to save product', 'error');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || isOutOfStock) return;

    const res = await addToCart(product._id);
    if (res.success) {
      showFeedback('Added to cart! 🛒', 'success');
    } else {
      if (res.status === 401) {
        navigate('/login', { state: { message: 'Please log in to add items to your cart' } });
      } else {
        showFeedback(res.message || 'Could not add to cart', 'error');
      }
    }
  };

  return (
    <div
      className="group relative bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
      id={`product-card-${product._id}`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-md">
          {product.category}
        </span>

        {/* Floating Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-rose-500/40 hover:bg-rose-600'
              : 'bg-slate-900/80 text-slate-300 hover:text-rose-400 hover:bg-slate-900 border border-slate-700/60'
          } ${wishlistLoading ? 'opacity-70 cursor-wait' : ''}`}
          id={`wishlist-heart-btn-${product._id}`}
        >
          {wishlistLoading ? (
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>

        {/* Stock Badge */}
        <span
          className={`absolute bottom-3 left-3 px-2.5 py-1 text-[11px] font-medium rounded-full backdrop-blur-md shadow-md ${
            isOutOfStock
              ? 'bg-rose-950/90 text-rose-300 border border-rose-800/50'
              : product.stock < 10
              ? 'bg-amber-950/90 text-amber-300 border border-amber-800/50'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/50'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : `${product.stock} units left`}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Price Header */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Price</span>
            <div className="text-xl font-extrabold text-white">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Feedback Notices */}
          {feedbackMsg.text && (
            <div
              className={`p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 animate-fade-in ${
                feedbackMsg.type === 'error'
                  ? 'bg-rose-950/80 border border-rose-800/70 text-rose-300'
                  : 'bg-emerald-950/80 border border-emerald-800/70 text-emerald-300'
              }`}
            >
              <span>{feedbackMsg.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Row 1: View Details + Wishlist Button */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-center text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex items-center justify-center gap-1 cursor-pointer"
              id={`view-details-${product._id}`}
            >
              <span>View Details</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
              id={`wishlist-btn-${product._id}`}
            >
              <span>{isWishlisted ? '♥ Saved' : '♡ Wishlist'}</span>
            </button>
          </div>

          {/* Row 2: Add to Cart Button (Task 7) */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
            type="button"
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              isOutOfStock
                ? 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 cursor-wait'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40'
            }`}
            id={`add-to-cart-btn-${product._id}`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAddingToCart ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-indigo-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : cartQty > 0 ? (
              <>
                <span>🛒</span>
                <span>Add Another ({cartQty} in cart)</span>
              </>
            ) : (
              <>
                <span>🛒</span>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
