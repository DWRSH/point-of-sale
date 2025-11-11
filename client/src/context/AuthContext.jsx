// File: client/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider (यह हमारे App को "wrap" करेगा)
export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. जब ऐप लोड हो, तो localStorage से पुरानी लॉगिन जानकारी चेक करें
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
    setLoading(false);
  }, []);

  // 4. Login function
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const userData = response.data;
      
      // यूज़र की जानकारी को state में और localStorage में सेव करें
      setUserInfo(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      return userData; // लॉगिन सफल
    } catch (error) {
      throw error; // एरर को लॉगिन पेज पर भेजें
    }
  };
  
  // 5. Register function (और ऑटो-लॉगिन)
  const register = async (name, email, password, role) => {
    try {
      const response = await authService.register(name, email, password, role);
      const userData = response.data;

      // यूज़र की जानकारी को state में और localStorage में सेव करें
      setUserInfo(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      return userData; // रजिस्टर सफल
    } catch (error) {
      throw error; // एरर को रजिस्टर पेज पर भेजें
    }
  };


  // 6. Logout function
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    // (हम बाद में यूज़र को लॉगिन पेज पर भी भेजेंगे)
  };

  // 7. Context की वैल्यू
  const value = {
    userInfo, // क्या यूज़र लॉगिन है?
    loading,  // क्या हम अभी भी localStorage चेक कर रहे हैं?
    login,
    register,
    logout,
  };

  // 8. Provider को children के साथ रेंडर करें
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 9. (सबसे ज़रूरी) एक हुक (hook) बनाएँ ताकि हम किसी भी पेज से यूज़र की जानकारी पा सकें
export const useAuth = () => {
  return useContext(AuthContext);
};