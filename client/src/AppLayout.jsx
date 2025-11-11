// File: client/src/AppLayout.jsx

import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom"; // 1. (बदलाव) Outlet को इम्पोर्ट करें
import { useAuth } from "./context/AuthContext"; // 2. (नया) AuthContext इम्पोर्ट करें

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth(); // 3. (नया) logout फंक्शन लें

  const navLinkClass = ({ isActive }) => {
    const base =
      "block px-3 py-2 font-semibold rounded-md transition-colors duration-200";
    return isActive
      ? `${base} text-white bg-blue-600`
      : `${base} text-gray-300 hover:text-white hover:bg-gray-700`;
  };

  // (नया) मोबाइल पर मेनू बंद करने और लॉगआउट करने के लिए
  const handleMobileLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    // (नया) हमने इसे स्क्रीन-फिलिंग लेआउट बनाया
    <div className="flex flex-col h-screen">
      {/* Navbar (जैसा आपका था) */}
      <nav className="bg-gray-900 w-full flex-shrink-0">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">
          {/* Brand */}
          <NavLink to="/" className="text-2xl font-bold text-white">
            Vivah Galaxy
          </NavLink>

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-300 hover:text-white focus:outline-none md:hidden"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Links (Desktop) */}
          <ul className="hidden md:flex space-x-2 items-center">
            <li><NavLink to="/" className={navLinkClass}>Dashboard</NavLink></li>
            <li><NavLink to="/pos" className={navLinkClass}>Billing (POS)</NavLink></li>
            <li><NavLink to="/products" className={navLinkClass}>Products</NavLink></li>
            <li><NavLink to="/sales" className={navLinkClass}>Sales History</NavLink></li>
            <li><NavLink to="/returns" className={navLinkClass}>Return History</NavLink></li>
            <li><NavLink to="/customers" className={navLinkClass}>Customers</NavLink></li>
            {/* 4. (नया) Desktop Logout Button */}
            <li>
              <button onClick={logout} className="block px-3 py-2 font-semibold rounded-md text-red-400 hover:text-white hover:bg-red-600">
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Links (Mobile Dropdown) */}
        {menuOpen && (
          <div className="md:hidden bg-gray-800 px-4 pb-3 space-y-1">
            <NavLink to="/" onClick={() => setMenuOpen(false)} className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/pos" onClick={() => setMenuOpen(false)} className={navLinkClass}>Billing (POS)</NavLink>
            <NavLink to="/products" onClick={() => setMenuOpen(false)} className={navLinkClass}>Products</NavLink>
            <NavLink to="/sales" onClick={() => setMenuOpen(false)} className={navLinkClass}>Sales History</NavLink>
            <NavLink to="/returns" onClick={() => setMenuOpen(false)} className={navLinkClass}>Return History</NavLink>
            <NavLink to="/customers" onClick={() => setMenuOpen(false)} className={navLinkClass}>Customers</NavLink>
            {/* 5. (नया) Mobile Logout Button */}
            <button onClick={handleMobileLogout} className="block w-full text-left px-3 py-2 font-semibold rounded-md text-red-400 hover:text-white hover:bg-red-600">
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      {/* 6. (नया) Outlet आपके सभी पेज (Dashboard, POS, etc.) यहाँ रेंडर करेगा */}
      <main className="flex-grow overflow-y-auto bg-gray-100">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;