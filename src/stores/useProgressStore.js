import { create } from "zustand";

export const useProgressStore = create((set) => ({
  progress: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProgress: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const url = userId ? `/api/progress?userId=${encodeURIComponent(userId)}` : "/api/progress";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch progress");

      set({ progress: data?.data || null, isLoading: false });
      return data?.data || null;
    } catch (error) {
      set({ error: error.message || "Unable to load progress", isLoading: false });
      return null;
    }
  },

  saveProgress: async (payload, userId) => {
    set({ isSaving: true, error: null });
    try {
      const url = userId ? `/api/progress?userId=${encodeURIComponent(userId)}` : "/api/progress";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save progress");

      set({ progress: data.data, isSaving: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to save progress", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  updateProgress: async (payload, userId) => {
    return useProgressStore.getState().saveProgress(payload, userId);
  },

  deleteProgress: async (userId) => {
    set({ isSaving: true, error: null });
    try {
      const url = userId ? `/api/progress?userId=${encodeURIComponent(userId)}` : "/api/progress";
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete progress");

      set({ progress: null, isSaving: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to delete progress", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  clearProgress: () => set({ progress: null, error: null }),
}));
