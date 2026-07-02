"use client"

import React, { useEffect, useState } from "react";
import { useProductStore } from "@/stores/useProductStore"; 

export default function ProductManagement() {
  const {
    products,
    isLoading,
    isSaving,
    error,
    fetchProducts,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    selectedProduct,
  } = useProductStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle opening the update modal
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price,
      category: product.category,
      usageTime: product.usageTime,
    });
    setIsEditModalOpen(true);
  };

  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated product data
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const result = await updateProduct(selectedProduct._id, editFormData);
    if (result.success) {
      setIsEditModalOpen(false);
    }
  };

  // Handle product deletion
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] text-[#0A0A1A] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 border-b border-[#7B5EA7]/20 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0A1A]">
              Product <span className="text-[#FF3E7F]">Inventory</span>
            </h1>
            <p className="text-sm text-[#7B5EA7] mt-1">Manage, update, and review listed formulations.</p>
          </div>
          <div className="bg-[#0A0A1A] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            Total items: {products.length}
          </div>
        </header>

        {/* Global Error/Loading State Indicators */}
        {error && (
          <div className="mb-6 p-4 bg-[#FF3E7F]/10 border border-[#FF3E7F] text-[#FF3E7F] rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF3E7F]"></div>
            <p className="mt-4 text-[#7B5EA7] font-medium">Fetching catalog items...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#7B5EA7]/10 shadow-sm">
            <p className="text-lg text-[#7B5EA7]">No products found in the database.</p>
          </div>
        ) : (
          /* Products Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#7B5EA7]/10 transition-all duration-300 hover:shadow-md hover:border-[#7B5EA7]/40 flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Category & Badge Tags */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#7B5EA7]/10 text-[#7B5EA7]">
                      {product.category || "General"}
                    </span>
                    <div className="flex gap-1">
                      {product.isDermatologistRecommended && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#E8A838]/20 text-[#E8A838] border border-[#E8A838]/30">
                          Derma Rec
                        </span>
                      )}
                      {product.isCrueltyFree && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          Cruelty Free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Brand */}
                  <h3 className="text-xl font-bold text-[#0A0A1A] line-clamp-1 mb-0.5">{product.name}</h3>
                  <p className="text-xs font-semibold text-[#7B5EA7] tracking-wide uppercase mb-3">{product.brand}</p>
                  
                  {/* Description */}
                  <p className="text-sm text-[#0A0A1A]/70 line-clamp-2 mb-4 h-10">{product.description}</p>

                  {/* Key Meta Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F5F0EB]/50 p-3 rounded-xl text-xs text-[#0A0A1A]/80 mb-4">
                    <div><span className="text-[#7B5EA7] font-medium">Time:</span> {product.usageTime || "N/A"}</div>
                    <div><span className="text-[#7B5EA7] font-medium">Safety Score:</span> {product.safetyScore || "N/A"}</div>
                    <div className="col-span-2 truncate">
                      <span className="text-[#7B5EA7] font-medium">Ingredients:</span> {
                        product.ingredients?.length 
                          ? product.ingredients.map(i => i.ingredientText).join(', ') 
                          : 'None Listed'
                      }
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-6 py-4 bg-[#0A0A1A]/5 border-t border-[#7B5EA7]/10 flex items-center justify-between mt-auto">
                  <div className="text-lg font-black text-[#0A0A1A]">
                    {product.currency === "INR" ? "₹" : "$"}
                    {product.price}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#7B5EA7] text-[#7B5EA7] transition-all hover:bg-[#7B5EA7] hover:text-white"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF3E7F] text-white transition-all hover:bg-[#FF3E7F]/90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update / Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-[#0A0A1A]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-[#7B5EA7]/20">
              <div className="p-6 border-b border-[#7B5EA7]/10 flex justify-between items-center bg-[#0A0A1A] text-white">
                <h2 className="text-xl font-bold">Update Product</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="text-white/70 hover:text-white text-xl font-bold focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#7B5EA7] mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#7B5EA7]/30 rounded-lg focus:outline-none focus:border-[#FF3E7F] bg-[#F5F0EB]/30 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#7B5EA7] mb-1">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={editFormData.brand || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#7B5EA7]/30 rounded-lg focus:outline-none focus:border-[#FF3E7F] bg-[#F5F0EB]/30 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#7B5EA7] mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={editFormData.category || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#7B5EA7]/30 rounded-lg focus:outline-none focus:border-[#FF3E7F] bg-[#F5F0EB]/30 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#7B5EA7] mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price || 0}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#7B5EA7]/30 rounded-lg focus:outline-none focus:border-[#FF3E7F] bg-[#F5F0EB]/30 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#7B5EA7] mb-1">Usage Time</label>
                    <select
                      name="usageTime"
                      value={editFormData.usageTime || "Both"}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#7B5EA7]/30 rounded-lg focus:outline-none focus:border-[#FF3E7F] bg-[#F5F0EB]/30 text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#7B5EA7] mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description || ""}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-[#7B5EA7]/30 rounded-lg focus:outline-none focus:border-[#FF3E7F] bg-[#F5F0EB]/30 text-sm resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#7B5EA7]/10">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium border border-[#7B5EA7]/30 rounded-lg hover:bg-[#F5F0EB] text-[#0A0A1A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-sm font-medium bg-[#FF3E7F] text-white rounded-lg hover:bg-[#FF3E7F]/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}