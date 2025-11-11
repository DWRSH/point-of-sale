// File: server/routes/return.routes.js

const express = require('express');
const router = express.Router();
const { 
  createReturn,
  getReturnHistory // 1. नया कंट्रोलर इम्पोर्ट करें
} = require('../controllers/return.controller');

// POST /api/returns (एक नया रिटर्न बनाएँ)
router.post('/', createReturn);

// GET /api/returns (सारे रिटर्न्स की हिस्ट्री पाएँ)
router.get('/', getReturnHistory); // 2. नया रूट जोड़ें

module.exports = router;