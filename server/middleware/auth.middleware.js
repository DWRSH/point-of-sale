// File: server/middleware/auth.middleware.js

// 1. Bypass Protect (यह मान लेगा कि यूज़र लॉगिन है और कोई टोकन नहीं मांगेगा)
const protect = async (req, res, next) => {
  // हम एक नकली यूज़र बना रहे हैं ताकि आपका ऐप क्रैश न हो
  req.user = { 
    _id: "fake_user_id", 
    name: "Test User", 
    role: "admin" 
  };
  
  next(); // बिना टोकन चेक किए आगे जाने दें
};

// 2. Bypass Admin (यह मान लेगा कि यूज़र एडमिन है)
const admin = (req, res, next) => {
  next(); // बिना रोल चेक किए आगे जाने दें
};

export { protect, admin };
