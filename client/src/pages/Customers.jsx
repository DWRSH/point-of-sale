import React, { useState, useEffect, useMemo } from 'react';
import customerService from '../services/customer.service';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [customerHistory, setCustomerHistory] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers();
      setCustomers(res.data);
    } catch {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address || '').toLowerCase().includes(q)
    );
  }, [searchTerm, customers]);

  const handleOpenPaymentModal = (c) => {
    setSelectedCustomer(c);
    setPaymentAmount('');
    setPaymentError('');
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return setPaymentError('Enter valid amount');
    if (amount > (selectedCustomer?.outstandingBalance ?? 0))
      return setPaymentError('Amount exceeds due');

    try {
      const res = await customerService.addPayment(selectedCustomer._id, amount);
      setCustomers((prev) => prev.map((x) => (x._id === res.data._id ? res.data : x)));
      alert('Payment added!');
      setIsPaymentModalOpen(false);
      setSelectedCustomer(null);
    } catch {
      setPaymentError('Failed to add payment');
    }
  };

  const handleOpenHistoryModal = async (c) => {
    setSelectedCustomer(c);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await customerService.getCustomerDetails(c._id);
      setCustomerHistory(res.data);
    } catch {
      setPaymentError('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const combinedHistory = useMemo(() => {
    if (!customerHistory) return [];
    const sales = (customerHistory.purchaseHistory || []).map((s) => ({
      type: 'Bill',
      date: new Date(s.createdAt),
      amount: s.totalAmount,
      details: `Bill #${s._id.slice(-6)} (${s.items.length} items)`,
    }));
    const payments = (customerHistory.paymentHistory || []).map((p) => ({
      type: 'Payment',
      date: new Date(p.createdAt),
      amount: p.amountPaid,
      details: `Payment (${p.paymentType})`,
    }));
    return [...sales, ...payments].sort((a, b) => b.date - a.date);
  }, [customerHistory]);

  return (
    <div className="container mx-auto px-2 sm:px-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          Customers
        </h1>
        <input
          type="text"
          placeholder="Search name, phone, address..."
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Table for desktop */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Outstanding</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{c.address || '—'}</td>
                <td className="px-4 py-3 font-semibold text-red-600">
                  ₹{(c.outstandingBalance ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button
                    onClick={() => handleOpenPaymentModal(c)}
                    className="text-green-600 hover:underline disabled:text-gray-400"
                    disabled={(c.outstandingBalance ?? 0) <= 0}
                  >
                    Pay
                  </button>
                  <button
                    onClick={() => handleOpenHistoryModal(c)}
                    className="text-blue-600 hover:underline"
                  >
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for mobile */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.map((c) => (
          <div key={c._id} className="bg-white rounded-xl shadow p-4">
            <p className="font-semibold text-gray-900 text-lg">{c.name}</p>
            <p className="text-gray-700 text-sm">📞 {c.phone}</p>
            {c.address && <p className="text-gray-600 text-sm">🏠 {c.address}</p>}
            <p className="mt-2 font-medium">
              Due:{' '}
              <span className={c.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                ₹{(c.outstandingBalance ?? 0).toFixed(2)}
              </span>
            </p>
            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => handleOpenPaymentModal(c)}
                disabled={(c.outstandingBalance ?? 0) <= 0}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg disabled:bg-gray-300"
              >
                Pay
              </button>
              <button
                onClick={() => handleOpenHistoryModal(c)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg"
              >
                History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-3">Add Payment</h2>
            <p>
              <strong>{selectedCustomer?.name}</strong>
            </p>
            <p className="mb-3">
              Due: ₹{selectedCustomer?.outstandingBalance?.toFixed(2) ?? '0.00'}
            </p>
            <input
              type="number"
              placeholder="Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            {paymentError && <p className="text-red-500 text-sm mb-2">{paymentError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-lg overflow-y-auto p-4">
            <h2 className="text-xl font-bold mb-3">History</h2>
            <p className="font-semibold">{selectedCustomer?.name}</p>
            <p className="mb-3 text-sm">
              Due: ₹{selectedCustomer?.outstandingBalance?.toFixed(2) ?? '0.00'}
            </p>

            {historyLoading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full text-sm border-t border-gray-200">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Details</th>
                    <th className="p-2 text-right">Debit</th>
                    <th className="p-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedHistory.map((h, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{formatDate(h.date)}</td>
                      <td className="p-2">{h.details}</td>
                      <td className="p-2 text-right text-red-600">
                        {h.type === 'Bill' ? `-₹${h.amount.toFixed(2)}` : ''}
                      </td>
                      <td className="p-2 text-right text-green-600">
                        {h.type === 'Payment' ? `+₹${h.amount.toFixed(2)}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="mt-4 bg-gray-600 text-white py-2 px-4 rounded w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
