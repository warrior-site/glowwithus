import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch products");
      }

      set({ products: data?.data || [], isLoading: false });
      return data?.data || [];
    } catch (error) {
      set({ error: error.message || "Unable to load products", isLoading: false });
      return [];
    }
  },

  createProduct: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create product");
      }

      set((state) => ({
        products: [data.data, ...state.products],
        isSaving: false,
      }));

      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to create product", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (id, payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update product");
      }

      set((state) => ({
        products: state.products.map((product) => (product._id === id ? data.data : product)),
        selectedProduct: data.data,
        isSaving: false,
      }));

      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to update product", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete product");
      }

      set((state) => ({
        products: state.products.filter((product) => product._id !== id),
        selectedProduct: state.selectedProduct?._id === id ? null : state.selectedProduct,
        isSaving: false,
      }));

      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to delete product", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  clearProducts: () => set({ products: [], selectedProduct: null, error: null }),
}));
