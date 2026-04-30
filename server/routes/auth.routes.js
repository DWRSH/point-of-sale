// File: server/routes/auth.routes.js

import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
} from '../controllers/auth.controller.js';

// POST /api/auth/register
// (बदलाव) - रजिस्टर करने के लिए अब लॉगिन या 'admin' होने की ज़रूरत नहीं है।
router.post('/register', registerUser);

// POST /api/auth/login
// (यह पब्लिक रहेगा, कोई भी लॉगिन कर सकता है)
router.post('/login', loginUser);

export default router;
