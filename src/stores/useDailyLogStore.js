import { create } from "zustand";

const today = new Date().toISOString().split("T")[0];

const normalizeLog = (log) => {
  if (!log) return null;
  return {
    ...log,
    log_date: log.log_date ? new Date(log.log_date).toISOString().split("T")[0] : today,
  };
};

export const useDailyLogStore = create((set, get) => ({
  logDate: today,
  log: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadDailyLog: async (date = get().logDate, userId) => {
  set({ isLoading: true, error: null, log: null });

  try {
    // Build the URL with both date and userId query parameters
    let url = `/api/logs?date=${encodeURIComponent(date)}`;
    if (userId) {
      url += `&userId=${encodeURIComponent(userId)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to load daily log");
    }

    const normalized = normalizeLog(data?.data || null);
    set({ log: normalized, isLoading: false });
    return normalized;
  } catch (error) {
    set({ error: error.message || "Unable to load daily log", isLoading: false });
    return null;
  }
},

  saveDailyLog: async (payload,streak) => {
    set({ isSaving: true, error: null });

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, streak }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to save daily log");
      }

      const normalized = normalizeLog(data.data);
      set({ log: normalized, isSaving: false });
      return normalized;
    } catch (error) {
      set({ error: error.message || "Unable to save daily log", isSaving: false });
      return null;
    }
  },
}));
