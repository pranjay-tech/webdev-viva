// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
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

        {/* Stock Badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-md shadow-md ${
            isOutOfStock
              ? 'bg-rose-950/90 text-rose-300 border border-rose-800/50'
              : product.stock < 10
              ? 'bg-amber-950/90 text-amber-300 border border-amber-800/50'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/50'
          }`}
        >
          {isOutOfStock
            ? 'Out of Stock'
            : `${product.stock} units left`}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Price</span>
            <div className="text-xl font-extrabold text-white">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center gap-1.5 cursor-pointer"
            id={`view-details-${product._id}`}
          >
            <span>View Details</span>
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
