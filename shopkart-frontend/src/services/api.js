// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses relative URL proxying (/customers -> http://localhost:5000)
  withCredentials: true, // Crucial for HttpOnly cookies
});

export default api;
