// File: server/utils/generateToken.js

import jwt from 'jsonwebtoken';

// यह फंक्शन लॉगिन करने पर यूज़र के लिए एक सुरक्षित (secure) JWT टोकन बनाएगा
const generateToken = (userId) => {
  // हम यूज़र की ID को टोकन के अंदर सेव कर रहे हैं
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // यह टोकन 30 दिन में एक्सपायर होगा
  });
  
  // हम टोकन को JSON के रूप में वापस भेजेंगे
  return token;
};

export default generateToken;