// File: server/controllers/dashboard.controller.js

// (बदलाव) 'import' करते समय { } का इस्तेमाल न करें
import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';
import Customer from '../models/customer.model.js';

// @desc   Get dashboard stats
// @route  GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Sale.find() अब काम करना चाहिए
    const todaySales = await Sale.find({
      createdAt: { $gte: todayStart },
    });

    const totalSalesToday = todaySales.reduce(
      (acc, sale) => acc + sale.finalAmount, // Discount के बाद का फाइनल अमाउंट
      0
    );
    
    const totalOrdersToday = todaySales.length;

    // Customer.countDocuments() अब काम करना चाहिए
    const totalCustomers = await Customer.countDocuments();

    // Product.find() अब काम करना चाहिए
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .limit(5)
      .select('name stock');

    res.status(200).json({
      totalSalesToday,
      totalOrdersToday,
      totalCustomers,
      lowStockProducts,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 'module.exports' की जगह 'export'
export {
  getDashboardStats,
};