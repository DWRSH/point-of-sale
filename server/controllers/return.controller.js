// File: server/controllers/return.controller.js

const Return = require('../models/return.model');
const Sale = require('../models/sale.model');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');
const mongoose = require('mongoose');

// @desc   Create a new return
// @route  POST /api/returns
const createReturn = async (req, res) => {
  const { 
    customer: customerId, 
    originalSale: saleId, 
    itemsReturned, 
    totalRefundAmount, 
    // refundType (अब हम इसे फ्रंटएंड से नहीं ले रहे हैं)
  } = req.body;

  // Validations
  if (!customerId || !saleId || !itemsReturned || itemsReturned.length === 0 || !totalRefundAmount) {
    return res.status(400).json({ message: 'Missing required fields for return.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(saleId).session(session);
    const customer = await Customer.findById(customerId).session(session);

    if (!sale) { throw new Error('Original sale not found.'); }
    if (!customer) { throw new Error('Customer not found.'); }

    // --- (बदलाव) स्मार्ट रिफंड लॉजिक ---
    const refundAmount = Number(totalRefundAmount);
    const customerDue = customer.outstandingBalance;

    // 1. तय करें कि कितना उधार एडजस्ट होगा और कितना कैश वापस होगा
    const dueAdjusted = Math.min(customerDue, refundAmount); // उधार, या रिफंड (जो भी कम हो)
    const cashReturned = refundAmount - dueAdjusted; // बचा हुआ कैश
    
    let finalRefundType = '';
    if (dueAdjusted > 0 && cashReturned > 0) {
      finalRefundType = 'Mixed'; // दोनों
    } else if (dueAdjusted > 0) {
      finalRefundType = 'AdjustedToDue'; // सिर्फ उधार
    } else {
      finalRefundType = 'CashBack'; // सिर्फ कैश
    }
    // ---

    // 2. स्टॉक और रिटर्न क्वांटिटी चेक करें
    const productStockUpdates = [];
    for (const itemToReturn of itemsReturned) {
      const originalItem = sale.items.find(i => i.productId.toString() === itemToReturn.productId);
      if (!originalItem) { throw new Error(`Item ${itemToReturn.name} not found in original sale.`); }

      const alreadyReturnedItem = sale.returnedItems.find(i => i.productId.toString() === itemToReturn.productId);
      const alreadyReturnedQty = alreadyReturnedItem ? alreadyReturnedItem.quantityReturned : 0;
      
      const maxReturnableQty = originalItem.quantity - alreadyReturnedQty;
      
      if (itemToReturn.quantity > maxReturnableQty) {
        throw new Error(`Cannot return ${itemToReturn.quantity} of ${itemToReturn.name}. Only ${maxReturnableQty} are left.`);
      }

      productStockUpdates.push({
        updateOne: {
          filter: { _id: itemToReturn.productId },
          update: { $inc: { stock: itemToReturn.quantity } } 
        }
      });
      
      if (alreadyReturnedItem) {
        alreadyReturnedItem.quantityReturned += itemToReturn.quantity;
      } else {
        sale.returnedItems.push({
          productId: itemToReturn.productId,
          quantityReturned: itemToReturn.quantity,
        });
      }
    }
    
    // 3. नया 'Return' (वापसी) बिल बनाएँ
    const newReturn = new Return({
      customer: customerId,
      originalSale: saleId,
      itemsReturned: itemsReturned,
      totalRefundAmount: refundAmount,
      refundType: finalRefundType, // (बदला हुआ)
      cashReturned: cashReturned,   // (नया)
      dueAdjusted: dueAdjusted      // (नया)
    });
    const createdReturn = await newReturn.save({ session });

    // 4. कस्टमर का बैलेंस (उधार) और हिस्ट्री अपडेट करें
    customer.outstandingBalance -= dueAdjusted; // सिर्फ एडजस्ट की हुई रकम ही उधार से कम करें
    customer.returnHistory.push(createdReturn._id);
    
    // 5. सभी अपडेट्स को एक साथ सेव करें
    await Product.bulkWrite(productStockUpdates, { session });
    await customer.save({ session });
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 6. (बदलाव) फ्रंटएंड को एक साफ़ मैसेज भेजें
    res.status(201).json({
      message: `Return successful! Due Adjusted: ₹${dueAdjusted.toFixed(2)}. Cash Back: ₹${cashReturned.toFixed(2)}`,
      returnData: createdReturn
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Return Transaction Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// ... (getReturnHistory function जैसा था वैसा ही है) ...
const getReturnHistory = async (req, res) => {
  try {
    const returns = await Return.find({})
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone')
      .populate('originalSale', '_id paymentStatus'); 

    res.status(200).json(returns);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createReturn,
  getReturnHistory,
};