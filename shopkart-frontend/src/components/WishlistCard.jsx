// src/components/WishlistCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div
      className="group relative bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
      id={`wishlist-card-${product._id}`}
    >
      {/* Product Image Section */}
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

        {/* Stock Status Badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-md shadow-md ${
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

      {/* Product Info Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || 'Premium quality curated ShopKart product.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Price</span>
            <div className="text-xl font-extrabold text-white">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Actions: View Details + Remove from Wishlist */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-center text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id={`wishlist-view-${product._id}`}
            >
              <span>View Details</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <button
              onClick={handleRemove}
              disabled={removing}
              type="button"
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 hover:border-rose-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-wait shadow-sm hover:shadow-rose-900/20"
              id={`wishlist-remove-${product._id}`}
            >
              {removing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-rose-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <span className="text-rose-400">♥</span>
                  <span>Remove</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
