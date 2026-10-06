// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses relative URL proxying (/customers, /products, /wishlist)
  withCredentials: true, // Crucial for HttpOnly cookies
});

// Attach Authorization header if token is stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopkart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
