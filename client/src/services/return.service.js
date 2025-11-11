import axios from "axios";

// 🌐 Backend Base URL (Direct)
const API_URL = import.meta.env.VITE_API_URL+"/api/returns";

const api = axios.create({
  baseURL: API_URL,
});

// 🔁 Create a return record
const createReturn = (returnData) => {
  // Example: { customer, originalSale, itemsReturned, totalRefundAmount }
  return api.post("/", returnData);
};

// 📜 Get all returns (optional)
const getReturns = () => {
  return api.get("/");
};

const returnService = {
  createReturn,
  getReturns,
};

export default returnService;
