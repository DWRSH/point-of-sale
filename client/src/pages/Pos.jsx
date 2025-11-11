// File: client/src/pages/Pos.jsx

import React, { useState, useEffect, useMemo } from 'react';
import productService from '../services/product.service';
import saleService from '../services/sale.service';

// ProductCard Component
function ProductCard({ product, onAddToCart }) {
  const hasStock = product.stock > 0;
  return (
    <div 
      className={`border rounded-lg p-3 flex flex-col justify-between shadow-sm bg-white transition-all duration-200 
      ${
        hasStock
          ? "cursor-pointer hover:shadow-md hover:-translate-y-1"
          : "opacity-50 cursor-not-allowed"
      }`}
      onClick={() => hasStock && onAddToCart(product)}
    >
      <div>
        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
        <p className="text-xs text-gray-600">{product.category}</p>
      </div>
      <div className="mt-2">
        <p className="text-sm font-bold">₹{product.price.toFixed(2)}</p>
        {hasStock ? (
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        ) : (
          <span className="text-xs text-red-500 font-bold">Out of Stock</span>
        )}
      </div>
    </div>
  );
}
// --- End of ProductCard ---


function Pos() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- (नया) Mobile Responsive State ---
  const [showBillMobile, setShowBillMobile] = useState(false);
  // ---

  // Customer States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); 

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [errors, setErrors] = useState({});
  const [paymentStatus, setPaymentStatus] = useState('Paid'); 
  const [amountPaid, setAmountPaid] = useState('');
  
  // Discount State
  const [discount, setDiscount] = useState(''); 

  // Fetch products on mount
  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const fetchProducts = async () => {
     setLoading(true);
     try {
        const response = await productService.getProducts();
        setProducts(response.data);
     } catch (err) {
        console.error("Error fetching products:", err);
     } finally {
        setLoading(false);
     }
  };

  // (बदलाव) Add to cart logic
  const handleAddToCart = (product) => {
    if (product.stock <= 0) { alert('This product is out of stock!'); return; }
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) { alert('No more stock available for this item!'); return; }
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setShowBillMobile(true); // (नया) कार्ट में जोड़ते ही मोबाइल पर बिल दिखाएँ
  };

  // Update quantity logic
  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p._id === productId);
    if (product && newQuantity > product.stock) {
        alert(`Cannot add more than ${product.stock} items (available stock).`);
        return;
    }
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item._id !== productId));
    } else {
      setCart(cart.map(item => item._id === productId ? { ...item, quantity: newQuantity } : item ));
    }
  };

  // --- Total Calculations ---
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);
  const discountAmount = useMemo(() => {
    const d = parseFloat(discount);
    return isNaN(d) || d < 0 ? 0 : d;
  }, [discount]);
  const finalAmount = useMemo(() => {
    const final = subtotal - discountAmount;
    return final < 0 ? 0 : final;
  }, [subtotal, discountAmount]);
  // ---

  // Filtered product list
  const filteredProducts = useMemo(() => 
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  // Manage Amount Paid when Payment Status changes
  useEffect(() => {
    if (paymentStatus === 'Paid') {
      setAmountPaid(finalAmount.toFixed(2));
    } else if (paymentStatus === 'Unpaid') {
      setAmountPaid('0');
    } else if (paymentStatus === 'Partial') {
      setAmountPaid('');
    }
  }, [paymentStatus, finalAmount]); 
  // ---

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\d{10}$/; 
    if (!customerName) { newErrors.customerName = 'Customer name is required.'; }
    if (!customerPhone) { newErrors.customerPhone = 'Phone number is required.'; } 
    else if (!phoneRegex.test(customerPhone)) { newErrors.customerPhone = 'Phone number must be exactly 10 digits.'; }
    const paidAmount = parseFloat(amountPaid);
    if (amountPaid === '' || isNaN(paidAmount)) { newErrors.amountPaid = 'Amount paid is required.'; } 
    else if (paidAmount < 0) { newErrors.amountPaid = 'Amount paid cannot be negative.'; } 
    else if (paidAmount > finalAmount) { newErrors.amountPaid = 'Amount paid cannot be more than the final amount.'; }
    if (discountAmount > subtotal) { newErrors.discount = 'Discount cannot be more than subtotal.'; }
    if (paymentStatus === 'Paid' && paidAmount !== finalAmount) { newErrors.amountPaid = 'Amount must equal final amount for "Paid" status.'; }
    if (paymentStatus === 'Unpaid' && paidAmount !== 0) { newErrors.amountPaid = 'Amount must be 0 for "Unpaid" status.'; }
    if (paymentStatus === 'Partial' && (paidAmount <= 0 || paidAmount >= finalAmount)) { newErrors.amountPaid = 'Partial amount must be between 0 and final amount.'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // (बदलाव) handleCheckout: Send all data to backend
  const handleCheckout = async () => {
    if (!validateForm()) { return; }
    if (cart.length === 0) { alert("Cart is empty"); return; }
    setIsProcessing(true); 

    const saleData = {
      cart: cart,
      totalAmount: subtotal,
      discountAmount: discountAmount,
      paymentMethod: paymentMethod,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      paymentStatus: paymentStatus,
      amountPaid: parseFloat(amountPaid),
    };

    try {
      await saleService.createSale(saleData);
      alert('Sale recorded successfully!');
      
      // Reset everything
      setCart([]); 
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setPaymentStatus('Paid');
      setAmountPaid('');
      setDiscount('');
      setErrors({});
      setShowBillMobile(false); // (नया) मोबाइल पर बिल को बंद करें
      
      fetchProducts(); 
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to record sale';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsProcessing(false); 
    }
  };

  return (
    // (बदलाव) Main Wrapper: overflow-hidden मोबाइल के लिए ज़रूरी है
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative"> 
      
      {/* Left Side: Product List */}
      {/* (बदलाव) मोबाइल पर 'hidden' होगा अगर showBillMobile true है */}
      <div className={`w-full md:w-3/5 p-4 overflow-y-auto ${showBillMobile ? 'hidden md:block' : 'block'}`}>
        <input type="text" placeholder="Search by product name or SKU..." className="w-full p-3 border rounded-lg shadow-sm mb-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        {loading ? (<p>Loading products...</p>) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (<ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />))}
          </div>
        )}
      </div>

      {/* Right Side: Bill/Cart */}
      {/* (बदलाव) यह div मोबाइल पर स्क्रीन को कवर करने के लिए 'fixed' है */}
      <div 
        className={`fixed inset-x-0 bottom-0 md:static h-full md:h-auto 
                    w-full md:w-2/5 flex flex-col bg-white 
                    border-t-2 md:border-t-0 md:border-l shadow-lg 
                    transition-transform duration-300 transform 
                    ${showBillMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}
      >
        
        {/* (नया) Mobile Header (सिर्फ मोबाइल पर दिखेगा) */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-100 md:hidden">
          <h2 className="font-bold text-lg">Bill / Checkout</h2>
          <button 
            className="text-blue-600 font-semibold px-3 py-1 rounded" 
            onClick={() => setShowBillMobile(false)}
          >
            ← Back to Products
          </button>
        </div>

        {/* Desktop Header (सिर्फ डेस्कटॉप पर दिखेगा) */}
        <h2 className="hidden md:block text-xl font-bold p-4 border-b">Bill</h2>
        
        {/* Cart Items (Scrollable) */}
        <div className="flex-grow p-4 overflow-y-auto">
          {cart.length === 0 ? (<p className="text-gray-500 text-center mt-10">Cart is empty</p>) : (
            cart.map(item => (
              <div key={item._id} className="flex justify-between items-center mb-3 p-2 rounded hover:bg-gray-50">
                <div><h4 className="font-semibold text-sm">{item.name}</h4><p className="text-xs text-gray-600">₹{item.price.toFixed(2)}</p></div>
                <div className="flex items-center">
                  <input type="number" min="1" className="w-14 text-center border rounded-md p-1 mx-2" value={item.quantity} onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value))} />
                  <button onClick={() => handleUpdateQuantity(item._id, 0)} className="text-red-500 hover:text-red-700 ml-2">X</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Total & Payment (Scrollable) */}
        <div className="p-4 border-t bg-gray-50 overflow-y-auto">
          
          {/* Customer Input Fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input type="text" className={`w-full p-2 border rounded-md shadow-sm ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Ramesh Kumar" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
            <input type="tel" className={`w-full p-2 border rounded-md shadow-sm ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., 9876543210" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required maxLength={10} />
            {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address (Optional)</label>
            <textarea className="w-full p-2 border border-gray-300 rounded-md shadow-sm" rows="2" placeholder="e.g., 123, ABC Street, Near Landmark" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select className="w-full p-2 border border-gray-300 rounded-md shadow-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option>Cash</option><option>Card</option><option>UPI</option>
            </select>
          </div>
          
          {/* Payment Status and Amount Paid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select className={`w-full p-2 border rounded-md shadow-sm ${errors.amountPaid ? 'border-red-500' : 'border-gray-300'}`} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="Paid">Full Payment (Paid)</option>
                <option value="Partial">Partial Payment</option>
                <option value="Unpaid">Unpaid (Credit)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
              <input type="number" className={`w-full p-2 border rounded-md shadow-sm ${errors.amountPaid ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} disabled={paymentStatus === 'Paid' || paymentStatus === 'Unpaid'} />
            </div>
          </div>
          {errors.amountPaid && <p className="text-red-500 text-xs mb-4 -mt-2">{errors.amountPaid}</p>}
          
          {/* Discount and Total */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-md">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <label htmlFor="discount" className="font-semibold text-gray-700">Discount (₹):</label>
              <input 
                id="discount"
                type="number"
                placeholder="0.00"
                className={`w-28 p-1 border rounded-md text-right ${errors.discount ? 'border-red-500' : 'border-gray-300'}`}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            {errors.discount && <p className="text-red-500 text-xs text-right">{errors.discount}</p>}
            
            <div className="flex justify-between items-center text-2xl font-bold border-t pt-2 mt-2">
              <span className="text-gray-900">Total Bill:</span>
              <span className="text-gray-900">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button 
            className="w-full bg-green-600 text-white text-lg font-bold py-3 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout} 
          >
            {isProcessing ? 'Processing...' : 'Save Bill'}
          </button>
        </div>
      </div>

      {/* --- (नया) Floating "View Bill" Button --- */}
      {/* यह सिर्फ मोबाइल पर दिखेगा, जब कार्ट खाली न हो और बिल छिपा हो */}
      {cart.length > 0 && !showBillMobile && (
        <button
          onClick={() => setShowBillMobile(true)}
          className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg z-20 animate-pulse"
        >
          View Bill ({cart.length})
        </button>
      )}

    </div>
  );
}

export default Pos;