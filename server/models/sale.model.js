// File: server/models/sale.model.js

import mongoose from 'mongoose';
const { Schema } = mongoose; // 'Schema' को mongoose से इस तरह import करें

const saleSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    // यह 'Subtotal' (डिस्काउंट से पहले का टोटल) है
    totalAmount: {
      type: Number,
      required: true,
    },

    // --- Discount फील्ड्स ---
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    // डिस्काउंट के बाद का फाइनल अमाउंट
    finalAmount: {
      type: Number,
      required: true,
    },
    // ---
    
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'Card', 'UPI', 'Multiple'],
      default: 'Cash',
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
    },
    amountDue: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Paid', 'Partial', 'Unpaid'],
      default: 'Paid',
    },
    returnedItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantityReturned: { type: Number, required: true },
      }
    ]
  },
  {
    timestamps: true,
  }
);

// 'module.exports' की जगह 'export default' का इस्तेमाल करें
const Sale = mongoose.model('Sale', saleSchema);
export default Sale;