// File: client/src/services/auth.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+"/api/auth";

const api = axios.create({
  baseURL: API_URL,
});

// Register a new user
const register = (name, email, password, role = 'staff') => {
  return api.post('/register', { name, email, password, role });
};

// Login a user
const login = (email, password) => {
  return api.post('/login', { email, password });
};

// (हम बाद में logout फंक्शन भी जोड़ेंगे)

const authService = {
  register,
  login,
};

export default authService;