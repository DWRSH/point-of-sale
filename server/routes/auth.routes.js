// File: server/routes/auth.routes.js

import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
} from '../controllers/auth.controller.js';
// 1. (नया) अपने गार्ड्स को इम्पोर्ट करें
import { protect, admin } from '../middleware/auth.middleware.js';

// POST /api/auth/register
// (बदलाव) - रजिस्टर करने के लिए, यूज़र का लॉगिन होना (protect)
// और 'admin' (admin) होना ज़रूरी है।
router.post('/register', protect, admin, registerUser);

// POST /api/auth/login
// (यह पब्लिक रहेगा, कोई भी लॉगिन कर सकता है)
router.post('/login', loginUser);

export default router;