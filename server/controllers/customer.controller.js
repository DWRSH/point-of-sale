// File: server/controllers/customer.controller.js

const Customer = require('../models/customer.model');
const Sale = require('../models/sale.model');
const Payment = require('../models/payment.model');
const mongoose = require('mongoose');

// @desc   Get all customers
// @route  GET /api/customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Get a single customer by ID (with full history)
// @route  GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    // 1. (बदलाव) अब हम दोनों हिस्ट्री को populate कर रहे हैं
    const customer = await Customer.findById(req.params.id)
      .populate('purchaseHistory') // सारे Bills की डिटेल्स लाएगा
      .populate('paymentHistory'); // सारे Payments की डिटेल्स लाएगा
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Add a payment to a customer's balance
// @route  POST /api/customers/:id/pay
const addPaymentToCustomer = async (req, res) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amountPaid } = req.body;
    const customerId = req.params.id;

    if (!amountPaid || Number(amountPaid) <= 0) {
      throw new Error('Payment amount must be greater than 0.');
    }

    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new Error('Customer not found.');
    }

    const paidAmount = Number(amountPaid);

    if (paidAmount > customer.outstandingBalance) {
      throw new Error(`Payment (${paidAmount}) cannot be greater than the outstanding balance (${customer.outstandingBalance}).`);
    }

    // 4. 'Due' (उधार) टाइप का एक नया Payment रिकॉर्ड बनाएँ
    const newPayment = new Payment({
      customer: customerId,
      amountPaid: paidAmount,
      paymentType: 'Due', // यह एक 'उधार' पेमेंट है
    });
    const createdPayment = await newPayment.save({ session });

    // 5. कस्टमर का बैलेंस और पेमेंट हिस्ट्री अपडेट करें
    customer.outstandingBalance -= paidAmount;
    customer.paymentHistory.push(createdPayment._id); // पेमेंट को हिस्ट्री में जोड़ें

    const updatedCustomer = await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(updatedCustomer);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};
// --- ---

module.exports = {
  getAllCustomers,
  getCustomerById, // यह अब अपडेट हो गया है
  addPaymentToCustomer,
};