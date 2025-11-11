// File: client/src/components/BillComponent.jsx

import React from 'react';

// 1. The component MUST start with 'React.forwardRef'
// It receives 'props' (which we destructure to {sale}) and 'ref'
const BillComponent = React.forwardRef(({ sale }, ref) => {
  
  // If there is no sale data, we MUST still render a div
  // and attach the ref to it, otherwise ref.current will be null.
  if (!sale) {
    return <div ref={ref}></div>;
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 2. The 'ref' MUST be passed to the main wrapper 'div'
  return (
    <div ref={ref} className="p-8 max-w-2xl mx-auto bg-white text-black">
      
      {/* 1. Shop Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-1">Saree Shop</h1>
        <p className="text-sm">123, Main Market, City Name</p>
        <p className="text-sm">GSTIN: YOUR_GST_NUMBER_HERE</p>
      </div>

      {/* 2. Bill and Customer Details */}
      <div className="flex justify-between mb-6">
        <div>
          <p className="font-semibold">Bill To:</p>
          <p>{sale.customer?.name || 'N/A'}</p>
          <p>{sale.customer?.phone || 'N/A'}</p>
          <p className="text-sm">{sale.customer?.address || ''}</p> 
        </div>
        <div className="text-right">
          <p><strong>Bill ID:</strong> ...{sale._id.slice(-6)}</p>
          <p><strong>Date:</strong> {formatDate(sale.createdAt)}</p>
          <p><strong>Payment:</strong> {sale.paymentMethod}</p>
        </div>
      </div>

      {/* 3. Items Table */}
      <table className="w-full mb-6">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Item Name</th>
            <th className="p-2 text-center">Qty</th>
            <th className="p-2 text-right">Price</th>
            <th className="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map(item => (
            <tr key={item.productId || item._id} className="border-b">
              <td className="p-2">{item.name}</td>
              <td className="p-2 text-center">{item.quantity}</td>
              <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
              <td className="p-2 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Grand Total (Discount के साथ) */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{sale.totalAmount.toFixed(2)}</span>
          </div>
          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-₹{sale.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
            <span>Grand Total:</span>
            <span>₹{sale.finalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span>Amount Paid:</span>
            <span className="font-semibold text-green-600">₹{sale.amountPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Amount Due:</span>
            <span className="font-semibold text-red-600">₹{sale.amountDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="text-center text-sm text-gray-600">
        <p><strong>Status: {sale.paymentStatus}</strong></p>
        <p>Thank you for shopping with us!</p>
      </div>
    </div>
  );
});

export default BillComponent;