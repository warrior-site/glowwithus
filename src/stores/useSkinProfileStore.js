import { create } from "zustand";

export const useSkinProfileStore = create((set) => ({
  skinProfile: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSkinProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const url = userId ? `/api/skin-profiles?userId=${encodeURIComponent(userId)}` : "/api/skin-profiles";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch skin profile");

      set({ skinProfile: data?.data || null, isLoading: false });
      return data?.data || null;
    } catch (error) {
      set({ error: error.message || "Unable to load skin profile", isLoading: false });
      return null;
    }
  },

  saveSkinProfile: async (payload, userId) => {
    set({ isSaving: true, error: null });
    try {
      const url = userId ? `/api/skin-profiles?userId=${encodeURIComponent(userId)}` : "/api/skin-profiles";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save skin profile");

      set({ skinProfile: data.data, isSaving: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to save skin profile", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  updateSkinProfile: async (payload, userId) => {
    return useSkinProfileStore.getState().saveSkinProfile(payload, userId);
  },

  deleteSkinProfile: async (userId) => {
    set({ isSaving: true, error: null });
    try {
      const url = userId ? `/api/skin-profiles?userId=${encodeURIComponent(userId)}` : "/api/skin-profiles";
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete skin profile");

      set({ skinProfile: null, isSaving: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to delete skin profile", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  clearSkinProfile: () => set({ skinProfile: null, error: null }),
}));
