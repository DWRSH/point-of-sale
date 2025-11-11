// File: client/src/pages/ReturnHistory.jsx

import React, { useState, useEffect, useMemo } from "react";
import returnService from "../services/return.service";

function ReturnHistory() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReturnHistory();
  }, []);

  const fetchReturnHistory = async () => {
    try {
      setLoading(true);
      const response = await returnService.getReturns();
      setReturns(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch return history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredReturns = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return returns.filter((ret) => {
      const customerName = ret.customer?.name?.toLowerCase() || "";
      const customerPhone = ret.customer?.phone || "";
      const billId = ret.originalSale?._id || "";
      const itemNames = ret.itemsReturned
        .map((item) => item.name.toLowerCase())
        .join(" ");

      return (
        customerName.includes(lower) ||
        customerPhone.includes(lower) ||
        billId.includes(lower) ||
        itemNames.includes(lower)
      );
    });
  }, [returns, searchTerm]);

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center md:text-left">
          Return History
        </h1>

        <input
          type="text"
          placeholder="Search by name, phone, bill ID, or item..."
          className="w-full md:w-80 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <p className="text-center text-gray-500 py-4">Loading return history...</p>
      )}
      {error && <p className="text-center text-red-500 py-4">{error}</p>}

      {/* ✅ Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3">Return Date</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Bill ID</th>
              <th className="px-6 py-3">Items Returned</th>
              <th className="px-6 py-3">Refund</th>
              <th className="px-6 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length === 0 && !loading && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-6 text-sm sm:text-base"
                >
                  No matching return records found.
                </td>
              </tr>
            )}

            {filteredReturns.map((ret) => (
              <tr
                key={ret._id}
                className="border-b hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-3 whitespace-nowrap">
                  {formatDate(ret.createdAt)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {ret.customer ? (
                    <>
                      <p className="font-semibold">{ret.customer.name}</p>
                      <p className="text-xs text-gray-500">{ret.customer.phone}</p>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-6 py-3 text-indigo-600 font-medium whitespace-nowrap">
                  ...{ret.originalSale._id.slice(-6)}
                </td>
                <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                  <ul className="space-y-1">
                    {ret.itemsReturned.map((item) => (
                      <li key={item.productId}>
                        {item.name}{" "}
                        <span className="text-xs text-gray-500">
                          (Qty: {item.quantity})
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-3 font-semibold text-red-600 whitespace-nowrap">
                  -₹{ret.totalRefundAmount.toFixed(2)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {ret.refundType === "AdjustedToDue" ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Adjusted to Due
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Cash Back
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredReturns.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-4">
            No matching return records found.
          </p>
        )}

        {filteredReturns.map((ret) => (
          <div
            key={ret._id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">{formatDate(ret.createdAt)}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  ret.refundType === "AdjustedToDue"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {ret.refundType === "AdjustedToDue" ? "Adjusted" : "Cash Back"}
              </span>
            </div>

            <div className="mb-2">
              <p className="font-semibold text-gray-900">
                {ret.customer?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500">{ret.customer?.phone}</p>
            </div>

            <p className="text-xs text-gray-500 mb-1">
              Bill ID: <span className="font-mono text-gray-700">...{ret.originalSale._id.slice(-6)}</span>
            </p>

            <ul className="text-sm text-gray-700 mb-2">
              {ret.itemsReturned.map((item) => (
                <li key={item.productId}>
                  {item.name}{" "}
                  <span className="text-xs text-gray-500">(Qty: {item.quantity})</span>
                </li>
              ))}
            </ul>

            <div className="text-right">
              <p className="text-red-600 font-semibold">
                -₹{ret.totalRefundAmount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReturnHistory;
