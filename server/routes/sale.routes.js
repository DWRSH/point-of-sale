// File: server/routes/sale.routes.js

const express = require('express');
const router = express.Router();

// Add getSalesHistory to this import list
const { 
  createSale, 
  getSalesHistory 
} = require('../controllers/sale.controller');

// POST /api/sales
router.post('/', createSale);

// GET /api/sales (Get all sales history)
router.get('/', getSalesHistory);

module.exports = router;