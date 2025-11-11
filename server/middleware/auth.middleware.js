// File: server/middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';

// 1. यह गार्ड चेक करेगा कि यूज़र लॉगिन है या नहीं
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1a. हम उम्मीद कर रहे हैं कि टोकन 'Authorization' हेडर में आएगा
  // (जैसे: 'Bearer eyJhbGciOi...')
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1b. टोकन को हेडर से निकालें
      token = req.headers.authorization.split(' ')[1];

      // 1c. टोकन को वेरीफाई (verify) करें
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1d. यूज़र की जानकारी (बिना पासवर्ड के) ढूँढें और उसे 'req' में जोड़ दें
      // ताकि आगे के सभी रूट्स (routes) को पता हो कि कौन सा यूज़र लॉगिन है
      req.user = await User.findById(decoded.userId).select('-password');

      next(); // सब ठीक है, अगले काम पर जाओ
    } catch (error) {
      console.error(error);
      res.status(401); // Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// 2. यह गार्ड चेक करेगा कि यूज़र 'Admin' है या नहीं
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // हाँ, यह एडमिन है
  } else {
    res.status(401); // Unauthorized
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };