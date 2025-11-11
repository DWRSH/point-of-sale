// File: server/models/customer.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    
    // Customer's purchase history (Bills)
    purchaseHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sale',
      },
    ],
    
    // Customer's Payment History (जमा किए गए पैसे)
    paymentHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],

    // --- (नया) Customer's Return History ---
    // कस्टमर ने कब-कब माल वापस किया
    returnHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Return', // यह नए 'Return' मॉडल से जुड़ा है
      },
    ],
    // ---
    
    // Customer's total outstanding balance
    outstandingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);