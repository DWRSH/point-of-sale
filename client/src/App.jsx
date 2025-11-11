// File: client/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// --- (यह है सही लाइन) ---
import { useAuth } from './context/AuthContext.jsx'; // .js की जगह .jsx

// Layout
import AppLayout from './AppLayout.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Pos from './pages/Pos.jsx';
import SalesHistory from './pages/SalesHistory.jsx';
import ReturnHistory from './pages/ReturnHistory.jsx';
import Customers from './pages/Customers.jsx'; 
import Login from './pages/Login.jsx';       
// (Register पेज हटा दिया गया है)

// (नया) यह कंपोनेंट हमारे मेन पेजों को सुरक्षित करेगा
// अगर यूज़र लॉगिन नहीं है, तो उसे लॉगिन पेज पर भेज देगा
function PrivateRoute({ children }) {
  const { userInfo } = useAuth();
  return userInfo ? children : <Navigate to="/login" replace />;
}

// (नया) यह कंपोनेंट लॉगिन/रजिस्टर पेज के लिए है
// अगर यूज़र पहले से लॉगिन है, तो उसे डैशबोर्ड पर भेज देगा
function PublicRoute({ children }) {
  const { userInfo } = useAuth();
  return !userInfo ? children : <Navigate to="/" replace />;
}


function App() {
  const { userInfo, loading } = useAuth(); 

  // जब तक AuthContext localStorage चेक कर रहा है, तब तक कुछ न दिखाएँ
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Loading Application...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- सुरक्षित (Protected) रूट्स --- */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} /> 
          <Route path="pos" element={<Pos />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<SalesHistory />} />
          <Route path="returns" element={<ReturnHistory />} />
          <Route path="customers" element={<Customers />} />
        </Route>

        {/* --- पब्लिक (Public) रूट्स --- */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* कोई और पेज न मिलने पर */}
        <Route path="*" element={<Navigate to={userInfo ? "/" : "/login"} replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;