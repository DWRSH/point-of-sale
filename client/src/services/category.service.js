// File: client/src/services/category.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+"/api/categories";

const api = axios.create({
  baseURL: API_URL,
});

// Get all categories
const getCategories = () => {
  return api.get('/');
};

// Create a new category
const createCategory = (name) => {
  // We send an object { name: "New Category Name" }
  return api.post('/', { name });
};

const categoryService = {
  getCategories,
  createCategory,
};

export default categoryService;
