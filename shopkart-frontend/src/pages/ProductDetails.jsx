// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const { addToCart, getItemQuantity, itemLoaders } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProductAndWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/products/${id}`);
        if (isMounted) {
          if (response.data?.success && response.data.product) {
            setProduct(response.data.product);
          } else {
            setProduct(response.data);
          }
        }

        // Check if item is in wishlist
        try {
          const wRes = await api.get('/wishlist');
          if (isMounted && wRes.data?.wishlist) {
            const hasIt = wRes.data.wishlist.some(
              (item) => (typeof item === 'object' ? item._id : item) === id
            );
            setIsWishlisted(hasIt);
          }
        } catch (wErr) {
          // not logged in or wishlist error
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load product details:', err);
          if (err.response?.status === 404) {
            setError('Product not found. The product may have been removed or does not exist.');
          } else if (err.response?.status === 400) {
            setError('Invalid product identifier.');
          } else {
            setError('Something went wrong while fetching product details.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductAndWishlist();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistFeedback('');

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
        setWishlistFeedback('Removed from Wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: id, added: false } }));
      } else {
        await api.post(`/wishlist/${id}`);
        setIsWishlisted(true);
        setWishlistFeedback('♥ Added to Wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: id, added: true } }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { message: 'Please log in to manage your wishlist' } });
        return;
      }
      setWishlistFeedback(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setWishlistFeedback(''), 3000);
    }
  };

  const handleAddToCart = async () => {
    if (itemLoaders[id] === 'adding') return;
    const res = await addToCart(id);
    if (res.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    } else if (res.status === 401) {
      navigate('/login', { state: { message: 'Please log in to add items to cart' } });
    } else {
      setAddedNotice(false);
      setWishlistFeedback(res.message || 'Could not add to cart');
      setTimeout(() => setWishlistFeedback(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-300 font-medium text-base">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Unable to Display Product</h2>
          <p className="text-sm text-slate-400">{error || 'Product not found.'}</p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
          <Link to="/home" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          <span className="text-indigo-400 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Card */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Section */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-lg">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  ShopKart Official
                </span>
                <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  SKU: {product._id.slice(-6).toUpperCase()}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 py-2 border-y border-slate-800/80">
                <span className="text-3xl md:text-4xl font-black text-white">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">Inclusive of all taxes</span>
              </div>

              {/* Stock Status Indicator */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Availability:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isOutOfStock
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOutOfStock ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} units available)`}
                </span>
              </div>

              {/* Description */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About this item
                </h3>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions: Quantity + Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-slate-800/80">
              {addedNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart! (Cart functionality will sync in Lab 04)
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button — wired to CartContext */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || itemLoaders[id] === 'adding'}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-slate-700 opacity-40 cursor-not-allowed'
                      : itemLoaders[id] === 'adding'
                      ? 'bg-indigo-900/70 border border-indigo-700/50 cursor-wait'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 hover:shadow-indigo-600/50'
                  }`}
                  id="add-to-cart-btn"
                >
                  {itemLoaders[id] === 'adding' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>
                        {isOutOfStock
                          ? 'Currently Unavailable'
                          : getItemQuantity(id) > 0
                          ? `Add Another (${getItemQuantity(id)} in cart)`
                          : 'Add to Cart'}
                      </span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  type="button"
                  className={`py-3.5 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                    isWishlisted
                      ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 shadow-rose-950/40'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white'
                  } ${wishlistLoading ? 'opacity-60 cursor-wait' : ''}`}
                  id="details-wishlist-btn"
                >
                  {wishlistLoading ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>Saving...</span>
                    </>
                  ) : isWishlisted ? (
                    <>
                      <span className="text-rose-400">♥</span>
                      <span>Saved in Wishlist</span>
                    </>
                  ) : (
                    <>
                      <span>♡</span>
                      <span>Add to Wishlist</span>
                    </>
                  )}
                </button>
              </div>

              {wishlistFeedback && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <span>ℹ️</span>
                  <span>{wishlistFeedback}</span>
                </div>
              )}

              {/* Back to Products Link */}
              <div className="pt-2 text-center">
                <Link
                  to="/products"
                  className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to All Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
