// File: client/src/services/dashboard.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+"/api/dashboard";

const api = axios.create({
  baseURL: API_URL,
});

// Get dashboard stats
const getStats = () => {
  return api.get('/stats');
};

const dashboardService = {
  getStats,
};

export default dashboardService;
