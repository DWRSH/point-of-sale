// File: server/routes/customer.routes.js

const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  addPaymentToCustomer, // 1. नया कंट्रोलर इम्पोर्ट करें
} = require('../controllers/customer.controller');

// GET /api/customers (Get all customers)
router.get('/', getAllCustomers);

// GET /api/customers/:id (Get single customer)
router.get('/:id', getCustomerById);

// POST /api/customers/:id/pay (Add a payment)
router.post('/:id/pay', addPaymentToCustomer); // 2. नया रूट जोड़ें

module.exports = router;