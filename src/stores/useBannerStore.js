import { create } from "zustand";

export const useBannerStore = create((set) => ({
  banners: [],
  selectedBanner: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch banners");

      set({ banners: data?.data || [], isLoading: false });
      return data?.data || [];
    } catch (error) {
      set({ error: error.message || "Unable to load banners", isLoading: false });
      return [];
    }
  },

  createBanner: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create banner");

      set((state) => ({ banners: [data.data, ...state.banners], isSaving: false }));
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to create banner", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  updateBanner: async (id, payload) => {
    set({ isSaving: true, error: null });
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update banner");

      set((state) => ({
        banners: state.banners.map((banner) => (banner._id === id ? data.data : banner)),
        selectedBanner: data.data,
        isSaving: false,
      }));
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to update banner", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  deleteBanner: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete banner");

      set((state) => ({
        banners: state.banners.filter((banner) => banner._id !== id),
        selectedBanner: state.selectedBanner?._id === id ? null : state.selectedBanner,
        isSaving: false,
      }));
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to delete banner", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  setSelectedBanner: (banner) => set({ selectedBanner: banner }),
  clearBanners: () => set({ banners: [], selectedBanner: null, error: null }),
}));
