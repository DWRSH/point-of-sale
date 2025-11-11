// File: server/routes/category.routes.js

const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
} = require('../controllers/category.controller');

// GET /api/categories
router.get('/', getCategories);

// POST /api/categories
router.post('/', createCategory);

module.exports = router;