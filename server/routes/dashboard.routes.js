// File: server/routes/dashboard.routes.js

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
} = require('../controllers/dashboard.controller');

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

module.exports = router;