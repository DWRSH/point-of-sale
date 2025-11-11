// File: client/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import dashboardService from '../services/dashboard.service';

// Reusable Stat Card Component
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center">
        <div className="text-3xl md:text-4xl mr-4">{icon}</div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-center text-gray-600">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-4 text-center text-red-500">{error}</p>;
  }

  if (!stats) {
    return <p className="p-4 text-center text-gray-600">No data available.</p>;
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
        Admin Dashboard
      </h1>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Sales Today"
          value={`₹${stats.totalSalesToday.toFixed(2)}`}
          icon="💰"
        />
        <StatCard
          title="Total Orders Today"
          value={stats.totalOrdersToday}
          icon="📋"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="👥"
        />
      </div>

      {/* Low Stock Items List */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
          Low Stock Items (Top 5)
        </h2>
        {stats.lowStockProducts.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {stats.lowStockProducts.map((product) => (
              <li
                key={product._id}
                className="flex flex-col sm:flex-row justify-between sm:items-center py-3 text-sm sm:text-base"
              >
                <span className="text-gray-800 mb-1 sm:mb-0">{product.name}</span>
                <span className="font-semibold text-red-600">
                  Only {product.stock} left
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center sm:text-left">
            No low stock items. Good job!
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
