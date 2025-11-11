// File: server/models/payment.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    // किस कस्टमर ने यह पेमेंट की
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    // कितने पैसे जमा हुए
    amountPaid: {
      type: Number,
      required: true,
    },
    // पेमेंट का प्रकार (Type)
    paymentType: {
      type: String,
      required: true,
      enum: ['Sale', 'Due'], // 'Sale' = बिल के साथ आया पैसा, 'Due' = बाद में जमा किया गया उधार
    },
    // (वैकल्पिक) यह पेमेंट किस बिल के लिए था
    // हम इसे अभी खाली छोड़ सकते हैं, पर यह बाद में काम आएगा
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: false,
    },
  },
  {
    timestamps: true, // यह पेमेंट की तारीख (createdAt) को रिकॉर्ड करेगा
  }
);

module.exports = mongoose.model('Payment', paymentSchema);