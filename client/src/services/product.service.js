// File: client/src/services/product.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+"/api/products";
const api = axios.create({ baseURL: API_URL });

// Get all products
const getProducts = () => {
  return api.get('/');
};

// Create new product
const createProduct = (productData) => {
  return api.post('/', productData);
};

// Update a product
const updateProduct = (id, productData) => {
  return api.put(`/${id}`, productData);
};

// Delete a product
const deleteProduct = (id) => {
  return api.delete(`/${id}`);
};

const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;
