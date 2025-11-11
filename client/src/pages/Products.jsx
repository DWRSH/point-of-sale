// File: client/src/pages/Products.jsx

import React, { useState, useEffect } from "react";
import productService from "../services/product.service";
import categoryService from "../services/category.service";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      await fetchCategories();
      await fetchProducts();
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await categoryService.getCategories();
      const data = response.data;
      setCategories(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, category: data[0].name }));
      }
      setCategoryLoading(false);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setError("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category === "") {
      alert("Please add a category first.");
      return;
    }
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };
      if (isEditing) {
        const response = await productService.updateProduct(
          currentProductId,
          productData
        );
        setProducts((prev) =>
          prev.map((p) => (p._id === currentProductId ? response.data : p))
        );
        alert("Product updated successfully!");
      } else {
        const response = await productService.createProduct(productData);
        setProducts((prev) => [...prev, response.data]);
        alert("Product added successfully!");
      }
      resetForm();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "add"} product`
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      alert("Product deleted successfully!");
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProductId(product._id);
    setFormData({ ...product });
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    const defaultCategory = categories.length > 0 ? categories[0].name : "";
    setFormData({ ...emptyForm, category: defaultCategory });
  };

  const handleAddNewCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return alert("Please enter a category name.");
    try {
      const response = await categoryService.createCategory(name);
      setCategories([...categories, response.data]);
      setFormData({ ...formData, category: response.data.name });
      setNewCategoryName("");
    } catch {
      alert("Failed to add category");
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
        Product Management
      </h1>

      {/* Form Section */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          {isEditing ? "Update Product" : "Add New Product"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          <div>
            <label className={labelClass}>Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>SKU</label>
            <input
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={categoryLoading}
              className={inputClass}
            >
              {categoryLoading ? (
                <option>Loading categories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className={labelClass}>Add New Category</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 transition"
            >
              {isEditing ? "Update Product" : "Add Product"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product List */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
        Product List
      </h2>
      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ✅ Responsive Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium break-words">{p.name}</td>
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    ₹{p.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3 flex flex-col sm:flex-row justify-center gap-2 text-sm">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
