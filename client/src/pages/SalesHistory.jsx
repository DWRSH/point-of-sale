import React, { useState, useEffect, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import saleService from "../services/sale.service";
import returnService from "../services/return.service";
import BillComponent from "../components/BillComponent";

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const billComponentRef = useRef();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const handlePrint = useReactToPrint({
    content: () => billComponentRef.current,
    onBeforeGetContent: () => {
      if (!selectedSale) return Promise.reject(new Error("No sale selected"));
    },
  });

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [sales, search]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await saleService.getSales();
      setSales(response.data);
      setFilteredSales(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch sales history");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
    if (!query) {
      setFilteredSales(sales);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = sales.filter(
      (sale) =>
        sale.customer?.name?.toLowerCase().includes(lowerQuery) ||
        sale.customer?.phone?.toLowerCase().includes(lowerQuery) ||
        sale._id.toLowerCase().includes(lowerQuery)
    );
    setFilteredSales(filtered);
  };

  const handleOpenReturnModal = (sale) => {
    setSelectedSale(sale);
    const initialQuantities = {};
    for (const item of sale.items) {
      const returnedItem = sale.returnedItems?.find(
        (i) => i.productId.toString() === item.productId
      );
      const alreadyReturnedQty = returnedItem ? returnedItem.quantityReturned : 0;
      const maxReturnable = item.quantity - alreadyReturnedQty;
      initialQuantities[item.productId] = {
        current: 0,
        max: maxReturnable,
        name: item.name,
        price: item.price,
      };
    }
    setReturnQuantities(initialQuantities);
    setReturnError("");
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    setSelectedSale(null);
  };

  const handleReturnQuantityChange = (productId, value) => {
    const newQty = parseInt(value) || 0;
    const itemData = returnQuantities[productId];
    if (newQty < 0) return;
    if (newQty > itemData.max) {
      alert(`You can only return up to ${itemData.max} (remaining).`);
      return;
    }
    setReturnQuantities((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], current: newQty },
    }));
  };

  const totalRefundAmount = useMemo(() => {
    if (!selectedSale) return 0;
    return Object.keys(returnQuantities).reduce((total, productId) => {
      const item = returnQuantities[productId];
      return total + item.current * item.price;
    }, 0);
  }, [selectedSale, returnQuantities]);

  const handleSubmitReturn = async () => {
    setReturnLoading(true);
    setReturnError("");

    const itemsReturned = Object.keys(returnQuantities)
      .map((productId) => ({
        productId,
        name: returnQuantities[productId].name,
        price: returnQuantities[productId].price,
        quantity: returnQuantities[productId].current,
      }))
      .filter((item) => item.quantity > 0);

    if (itemsReturned.length === 0) {
      setReturnError("Please select quantity for at least one item to return.");
      setReturnLoading(false);
      return;
    }

    const returnData = {
      customer: selectedSale.customer._id,
      originalSale: selectedSale._id,
      itemsReturned,
      totalRefundAmount,
    };

    try {
      const response = await returnService.createReturn(returnData);
      alert(response.data.message);
      handleCloseReturnModal();
      fetchSales();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to process return.";
      setReturnError(errorMsg);
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
        Sales History
      </h1>

      {/* 🔍 Search Bar */}
      <div className="mb-5 flex justify-center md:justify-start">
        <input
          type="text"
          placeholder="Search by name, phone, or bill ID..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-1/3 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {loading && <p className="text-center text-gray-500">Loading sales...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* ✅ Responsive Sales Table / Mobile Cards */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Due</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-6">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <p className="font-semibold">{sale.customer?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">{sale.customer?.phone}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      ₹{sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          sale.paymentStatus
                        )}`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {sale.amountDue > 0 ? (
                        <span className="text-red-600">
                          ₹{sale.amountDue.toFixed(2)}
                        </span>
                      ) : (
                        <span>₹0.00</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right space-x-3">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="text-blue-600 hover:underline"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleOpenReturnModal(sale)}
                        className="text-red-600 hover:underline"
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Mobile Cards */}
        <div className="sm:hidden divide-y">
          {filteredSales.length === 0 && !loading ? (
            <p className="text-center text-gray-500 py-6">No records found.</p>
          ) : (
            filteredSales.map((sale) => (
              <div key={sale._id} className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-800">
                    {sale.customer?.name || "N/A"}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      sale.paymentStatus
                    )}`}
                  >
                    {sale.paymentStatus}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {sale.customer?.phone} • {formatDate(sale.createdAt)}
                </p>

                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-semibold">₹{sale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Due:</span>
                  <span
                    className={`font-semibold ${
                      sale.amountDue > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ₹{sale.amountDue.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setSelectedSale(sale)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenReturnModal(sale)}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Return
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedSale && !isReturnModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
              Sale Details (ID: ...{selectedSale._id.slice(-6)})
            </h2>

            {selectedSale.customer && (
              <div className="mb-3">
                <p className="font-semibold">{selectedSale.customer.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedSale.customer.phone}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-1">
              <strong>Date:</strong> {formatDate(selectedSale.createdAt)}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Payment:</strong> {selectedSale.paymentMethod}
            </p>

            <div className="divide-y border-t border-b">
              {selectedSale.items.map((item) => (
                <div
                  key={item.productId || item._id}
                  className="flex justify-between py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Total Bill:</span>
                <span>₹{selectedSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Amount Paid:</span>
                <span>₹{selectedSale.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Amount Due:</span>
                <span>₹{selectedSale.amountDue.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Print Bill
              </button>
            </div>

            <div className="hidden">
              <BillComponent ref={billComponentRef} sale={selectedSale} />
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {isReturnModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
              Return Items
            </h2>
            <p className="text-sm mb-2">
              Bill ID: <span className="text-gray-600">...{selectedSale._id.slice(-6)}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">Select quantity to return:</p>

            <div className="divide-y border-t border-b max-h-60 overflow-y-auto text-sm">
              {Object.keys(returnQuantities).map((productId) => {
                const item = returnQuantities[productId];
                return (
                  <div
                    key={productId}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Max Returnable: {item.max}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={item.max}
                      className="w-20 text-center border rounded-md p-1"
                      value={item.current}
                      onChange={(e) =>
                        handleReturnQuantityChange(productId, e.target.value)
                      }
                      disabled={item.max === 0}
                    />
                  </div>
                );
              })}
            </div>

            <div className="text-right mt-4">
              <p className="text-sm text-gray-600">Total Refund Amount</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{totalRefundAmount.toFixed(2)}
              </p>
            </div>

            {returnError && (
              <p className="text-red-500 text-xs mt-2">{returnError}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleCloseReturnModal}
                className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                disabled={returnLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReturn}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                disabled={returnLoading || totalRefundAmount === 0}
              >
                {returnLoading ? "Processing..." : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesHistory;
