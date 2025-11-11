import axios from "axios";

// 🌐 Backend Base URL (Direct)
const API_URL = import.meta.env.VITE_API_URL+"/api/sales";

const api = axios.create({
  baseURL: API_URL,
});

// 🧾 Create a new sale
const createSale = (saleData) => {
  // Example: { cart: [], totalAmount: 1000, paymentMethod: 'Cash' }
  return api.post("/", saleData);
};

// 📜 Get all sales
const getSales = () => {
  return api.get("/");
};

const saleService = {
  createSale,
  getSales,
};

export default saleService;
