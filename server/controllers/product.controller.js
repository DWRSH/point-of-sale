// File: server/controllers/product.controller.js

const Product = require('../models/product.model');

// @desc   Get all products
// @route  GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc   Create a new product
// @route  POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, sku, category, price, stock } = req.body;

    // 1. Better validation
    if (!name || !sku || !category) {
      return res.status(400).json({ message: 'Please fill name, sku, and category' });
    }
    
    // 2. We treat 0 as a valid value, so check for undefined
    if (price === undefined || stock === undefined) {
        return res.status(400).json({ message: 'Price and Stock are required' });
    }
    
    if (price <= 0) {
        return res.status(400).json({ message: 'Price must be greater than 0' });
    }
    
    if (stock < 0) {
        return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const product = new Product({
      name,
      sku,
      category,
      price,
      stock,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    // 3. Catch duplicate SKU error
    if (error.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ message: 'Error: SKU already exists. Please use a unique SKU.' });
    }
    
    // 4. Mongoose validation error
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }

    // 5. For all other errors
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Update a product
// @route  PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, sku, category, price, stock } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU is being changed and if new SKU already exists
    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({ sku: sku, _id: { $ne: productId } });
      if (skuExists) {
        return res.status(400).json({ message: 'Error: SKU already exists.' });
      }
    }

    // Update product
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price; // Allow price update
    product.stock = stock !== undefined ? stock : product.stock; // Allow stock to be 0

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Delete a product
// @route  DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};