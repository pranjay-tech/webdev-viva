// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import { CartProvider } from './context/CartContext';
import api from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const response = await api.get('/customers/me');
        setUser(response.data);
      } catch (err) {
        setUser(null);
      }
    };
    checkInitialAuth();
  }, []);

  return (
    <BrowserRouter>
      {/* CartProvider wraps the whole app so cart state is globally accessible */}
      <CartProvider user={user}>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
          <Navbar user={user} setUser={setUser} />
          <main className="flex-1">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/home" element={<Home user={user} setUser={setUser} />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
