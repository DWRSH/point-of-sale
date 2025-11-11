// File: server/models/return.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const returnSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    originalSale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: true,
    },
    itemsReturned: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    // कुल कितने पैसे वापस हुए
    totalRefundAmount: {
      type: Number,
      required: true,
    },
    
    // --- (बदलाव) ---
    // पैसे कैसे वापस किए गए?
    refundType: {
      type: String,
      required: true,
      enum: ['AdjustedToDue', 'CashBack', 'Mixed'], // Mixed = कुछ कैश, कुछ एडजस्ट
    },
    // कितना कैश वापस दिया गया
    cashReturned: {
      type: Number,
      required: true,
      default: 0,
    },
    // कितना उधार में एडजस्ट हुआ
    dueAdjusted: {
      type: Number,
      required: true,
      default: 0,
    }
    // ---
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Return', returnSchema);