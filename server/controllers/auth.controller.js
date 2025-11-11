// File: server/controllers/auth.controller.js

import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';

// @desc   Register a new user (नया यूज़र रजिस्टर करें)
// @route  POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. चेक करें कि यूज़र पहले से मौजूद है या नहीं
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); // Bad Request
    throw new Error('User already exists');
  }

  // 2. नया यूज़र बनाएँ (पासवर्ड अपने आप हैश हो जाएगा)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'staff', // अगर रोल नहीं दिया, तो 'staff'
  });

  if (user) {
    // 3. यूज़र बनने के बाद उसे टोकन दें (और ऑटो-लॉगिन करें)
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token, // टोकन को फ्रंटएंड पर भेजें
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc   Auth user & get token (यूज़र को लॉगिन करें)
// @route  POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. यूज़र को ईमेल से ढूँढें
  const user = await User.findOne({ email });

  // 2. अगर यूज़र है और पासवर्ड मैच होता है
  if (user && (await user.matchPassword(password))) {
    // 3. उसे एक नया टोकन दें
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token, // टोकन को फ्रंटएंड पर भेजें
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
});

export { registerUser, loginUser };