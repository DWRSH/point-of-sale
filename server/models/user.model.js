// File: server/models/user.model.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // पासवर्ड हैश करने के लिए

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // हर यूज़र का ईमेल अलग होना चाहिए
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    // (सबसे ज़रूरी) यूज़र का रोल
    role: {
      type: String,
      required: true,
      enum: ['admin', 'staff'], // सिर्फ यह दो वैल्यू हो सकती हैं
      default: 'staff', // डिफ़ॉल्ट 'स्टाफ' रहेगा
    },
  },
  {
    timestamps: true,
  }
);

// (नया) पासवर्ड को सेव करने से 'पहले' उसे हैश (encrypt) करें
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// (नया) लॉगिन के समय पासवर्ड मैच करने के लिए एक फंक्शन
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;