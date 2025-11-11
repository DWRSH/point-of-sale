// File: client/src/services/customer.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+"/api/customers";

const api = axios.create({
  baseURL: API_URL,
});

// Get all customers
const getCustomers = () => {
  return api.get('/');
};

// Get a single customer by ID (with full history)
const getCustomerDetails = (id) => {
  return api.get(`/${id}`);
};

// Add a payment for a customer
const addPayment = (id, amountPaid) => {
  return api.post(`/${id}/pay`, { amountPaid });
};

const customerService = {
  getCustomers,
  getCustomerDetails, // यह फंक्शन अब हमें पूरी हिस्ट्री देगा
  addPayment,
};

export default customerService;
