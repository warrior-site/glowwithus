import { create } from "zustand";

export const useRoutineStore = create((set, get) => ({
  routine: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchRoutine: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const url = userId ? `/api/routines?userId=${encodeURIComponent(userId)}` : "/api/routines";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch routine");

      set({ routine: data?.data || null, isLoading: false });
      return data?.data || null;
    } catch (error) {
      set({ error: error.message || "Unable to load routine", isLoading: false });
      return null;
    }
  },

  saveRoutine: async (payload, userId) => {
    set({ isSaving: true, error: null });
    try {
      const url = userId ? `/api/routines?userId=${encodeURIComponent(userId)}` : "/api/routines";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save routine");

      set({ routine: data.data, isSaving: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to save routine", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  updateRoutine: async (payload, userId) => {
    return get().saveRoutine(payload, userId);
  },

  deleteRoutine: async (userId) => {
    set({ isSaving: true, error: null });
    try {
      const url = userId ? `/api/routines?userId=${encodeURIComponent(userId)}` : "/api/routines";
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete routine");

      set({ routine: null, isSaving: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message || "Unable to delete routine", isSaving: false });
      return { success: false, error: error.message };
    }
  },

  addRoutineItem: async (section, item, userId) => {
    const currentRoutine = get().routine || { morning: [], night: [], weekly: [], recommendedProducts: [], adherence: { completedDays: 0, streak: 0 } };
    const nextRoutine = {
      ...currentRoutine,
      [section]: [...(currentRoutine[section] || []), item],
    };

    return get().saveRoutine(nextRoutine, userId);
  },

  removeRoutineItem: async (section, index, userId) => {
    const currentRoutine = get().routine || { morning: [], night: [], weekly: [], recommendedProducts: [], adherence: { completedDays: 0, streak: 0 } };
    const items = [...(currentRoutine[section] || [])];
    items.splice(index, 1);

    const nextRoutine = {
      ...currentRoutine,
      [section]: items,
    };

    return get().saveRoutine(nextRoutine, userId);
  },

  updateAdherence: async (adherence, userId) => {
    const currentRoutine = get().routine || { morning: [], night: [], weekly: [], recommendedProducts: [], adherence: { completedDays: 0, streak: 0 } };
    const nextRoutine = {
      ...currentRoutine,
      adherence: {
        ...(currentRoutine.adherence || {}),
        ...adherence,
      },
    };

    return get().saveRoutine(nextRoutine, userId);
  },

  clearRoutine: () => set({ routine: null, error: null }),
}));
