const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0,
    },
    // आप यहाँ और भी फ़ील्ड्स (जैसे images, description) जोड़ सकते हैं
  },
  {
    timestamps: true, // CreatedAt और UpdatedAt अपने आप बन जाएगा
  }
);

module.exports = mongoose.model('Product', productSchema);