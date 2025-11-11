// File: server/controllers/sale.controller.js

// 'require' की जगह 'import' का इस्तेमाल करें
import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';
import Customer from '../models/customer.model.js';
import Payment from '../models/payment.model.js';
import mongoose from 'mongoose';

// @desc   Create a new sale (bill)
// @route  POST /api/sales
const createSale = async (req, res) => {
  const { 
    cart, 
    totalAmount, // यह Subtotal है
    discountAmount, 
    paymentMethod, 
    customerName, 
    customerPhone,
    customerAddress,
    paymentStatus,
    amountPaid 
  } = req.body;

  // ... (Validations) ...
  if (!cart || cart.length === 0) { return res.status(400).json({ message: 'Cart is empty' }); }
  if (!customerName || !customerPhone) { return res.status(400).json({ message: 'Customer name and phone number are required.' }); }
  if (!paymentStatus || amountPaid === undefined) { return res.status(400).json({ message: 'Payment status and amount paid are required.' }); }

  const total = Number(totalAmount);
  const discount = Number(discountAmount) || 0;
  
  if (discount < 0) { return res.status(400).json({ message: 'Discount cannot be negative.' }); }
  if (discount > total) { return res.status(400).json({ message: 'Discount cannot be greater than total amount.' }); }

  const finalAmount = total - discount; 
  const paidAmount = Number(amountPaid);
  const amountDue = finalAmount - paidAmount; 

  // ... (Payment Logic Validations) ...
  if (paymentStatus === 'Paid' && amountDue !== 0) { return res.status(400).json({ message: 'For "Paid" status, amount paid must equal final amount.' }); }
  if (paymentStatus === 'Unpaid' && paidAmount !== 0) { return res.status(400).json({ message: 'For "Unpaid" status, amount paid must be 0.' }); }
  if (paymentStatus === 'Partial' && (paidAmount <= 0 || paidAmount >= finalAmount)) { return res.status(400).json({ message: 'For "Partial" status, amount paid must be greater than 0 and less than final amount.' }); }

  const session = await mongoose.startSession();
  session.startTransaction();

  let customerId = null;

  try {
    let customer = await Customer.findOne({ phone: customerPhone }).session(session);
    
    if (customer) {
      customer.name = customerName;
      customer.address = customerAddress || customer.address;
      customer.outstandingBalance += amountDue;
      await customer.save({ session });
      customerId = customer._id;
    } else {
      const newCustomer = new Customer({
        name: customerName,
        phone: customerPhone,
        address: customerAddress || '',
        outstandingBalance: amountDue 
      });
      const createdCustomer = await newCustomer.save({ session });
      customerId = createdCustomer._id;
    }

    // (Stock Check logic) ...
    for (const item of cart) { 
      const product = await Product.findById(item._id).session(session);
      if (!product) { throw new Error(`Product ${item.name} not found.`); }
      if (product.stock < item.quantity) { throw new Error(`Not enough stock for ${item.name}.`); }
    }

    // Sale (Bill) बनाएँ
    const sale = new Sale({
      items: cart.map(item => ({
        productId: item._id, name: item.name, price: item.price, quantity: item.quantity,
      })),
      totalAmount: total,         
      discountAmount: discount,   
      finalAmount: finalAmount,   
      paymentMethod: paymentMethod,
      customer: customerId,
      amountPaid: paidAmount,
      amountDue: amountDue,
      paymentStatus: paymentStatus
    });
    const createdSale = await sale.save({ session });

    // Payment रिकॉर्ड बनाएँ
    let newPaymentId = null;
    if (paidAmount > 0) {
      const newPayment = new Payment({
        customer: customerId,
        amountPaid: paidAmount,
        paymentType: 'Sale', 
        sale: createdSale._id 
      });
      const createdPayment = await newPayment.save({ session });
      newPaymentId = createdPayment._id;
    }

    // Customer की history को अपडेट करें
    const customerUpdateOperations = { $push: { purchaseHistory: createdSale._id } };
    if (newPaymentId) {
      customerUpdateOperations.$push.paymentHistory = newPaymentId;
    }
    await Customer.findByIdAndUpdate(customerId, customerUpdateOperations, { session: session });

    // प्रोडक्ट का स्टॉक कम करें
    const stockUpdates = cart.map(item => ({
      updateOne: { filter: { _id: item._id }, update: { $inc: { stock: -item.quantity } }, },
    }));
    await Product.bulkWrite(stockUpdates, { session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(createdSale);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc   Get all sales
// @route  GET /api/sales
const getSalesHistory = async (req, res) => {
  try {
    const sales = await Sale.find({})
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone address'); 
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error in getSalesHistory:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 'module.exports' की जगह 'export' का इस्तेमाल करें
export { createSale, getSalesHistory };