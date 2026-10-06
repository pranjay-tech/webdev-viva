// src/components/CartItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, itemLoaders } = useCart();

  if (!product) return null;

  const isUpdating = itemLoaders[product._id] === 'updating';
  const isRemoving = itemLoaders[product._id] === 'removing';
  const isBusy = isUpdating || isRemoving;

  const itemSubtotal = (Number(product.price) || 0) * quantity;
  const isMaxStock = quantity >= product.stock;

  const handleIncrement = () => {
    if (isBusy || isMaxStock) return;
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrement = () => {
    if (isBusy || quantity <= 1) return;
    updateQuantity(product._id, quantity - 1);
  };

  const handleRemove = () => {
    if (isBusy) return;
    removeFromCart(product._id);
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 transition-all ${
        isBusy ? 'opacity-70' : 'hover:border-slate-700'
      }`}
      id={`cart-item-${product._id}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Product Image & Details */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/products/${product._id}`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 group relative"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="min-w-0 space-y-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
              {product.category}
            </span>
            <Link
              to={`/products/${product._id}`}
              className="block font-bold text-slate-100 hover:text-indigo-400 transition-colors truncate text-base sm:text-lg"
              title={product.name}
            >
              {product.name}
            </Link>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Unit Price:</span>
              <span className="font-semibold text-slate-200">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
            </div>
            {isMaxStock && (
              <span className="text-[11px] font-semibold text-amber-400 inline-block">
                Max stock reached ({product.stock} units)
              </span>
            )}
          </div>
        </div>

        {/* Right: Quantity Controls, Subtotal, Remove */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          {/* Item Subtotal */}
          <div className="text-right sm:order-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium block">Total</span>
            <span className="text-lg sm:text-xl font-extrabold text-white">
              ₹{itemSubtotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Controls: [-] Qty [+] and Remove */}
          <div className="flex items-center gap-3 sm:order-2">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 shadow-inner">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || isBusy}
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer font-bold text-base"
                id={`cart-qty-dec-${product._id}`}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span
                className="w-9 text-center font-bold text-sm text-white"
                id={`cart-qty-val-${product._id}`}
              >
                {isUpdating ? (
                  <span className="inline-block animate-spin text-xs">⏳</span>
                ) : (
                  quantity
                )}
              </span>

              <button
                onClick={handleIncrement}
                disabled={isMaxStock || isBusy}
                type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer font-bold text-base"
                id={`cart-qty-inc-${product._id}`}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isBusy}
              type="button"
              className="p-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              id={`cart-remove-${product._id}`}
              title="Remove item"
            >
              {isRemoving ? (
                <svg className="w-4 h-4 animate-spin text-rose-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
