import { create } from "zustand";

const LOG = (...args) => console.log("[FacialAnalysisStore]", ...args);
const ERR = (...args) => console.error("[FacialAnalysisStore]", ...args);

export const useFacialAnalysisStore = create((set, get) => ({
  analysisData: null,
  history: [],
  isLoading: false,
  error: null,

  // Fetch latest scan from /api/get-analyze
  fetchAnalysisData: async (userId) => {
    if (!userId) {
      ERR("fetchAnalysisData called with no userId — aborting");
      return;
    }

    LOG("fetchAnalysisData → userId:", userId);
    set({ isLoading: true, error: null });

    try {
      const url = `/api/get-analyze?userId=${encodeURIComponent(userId)}`;
      LOG("GET", url);

      const response = await fetch(url);
      LOG("GET response status:", response.status, response.statusText);

      const result = await response.json();
      LOG("GET response body:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch facial analysis history");
      }

      const latestScan =
        Array.isArray(result.history) && result.history.length > 0
          ? result.history[0]
          : result.data || null;

      LOG("latestScan resolved:", latestScan?._id ?? "null");

      set({
        history: result.history || [],
        analysisData: latestScan,
        isLoading: false,
      });
    } catch (err) {
      ERR("fetchAnalysisData error:", err);
      set({ error: err.message || "Unable to load facial analysis history.", isLoading: false });
    }
  },

  // Upload image → analyze → store result
  uploadAndAnalyzeScan: async (userId, imageBase64) => {
    if (!userId) { ERR("uploadAndAnalyzeScan: no userId"); return null; }
    if (!imageBase64) { ERR("uploadAndAnalyzeScan: no imageBase64"); return null; }

    const previewSize = (imageBase64.length / 1024 / 1024).toFixed(2);
    LOG(`uploadAndAnalyzeScan → userId: ${userId}, base64 size: ~${previewSize}MB`);

    set({ isLoading: true, error: null });

    try {
      LOG("POST /api/analyze — sending...");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageBase64 }),
      });

      LOG("POST /api/analyze status:", response.status, response.statusText);

      // Read body as text first so we can log it even if JSON.parse fails
      const rawText = await response.text();
      LOG("POST /api/analyze raw response (first 500 chars):", rawText.slice(0, 500));

      let result;
      try {
        result = JSON.parse(rawText);
      } catch (parseErr) {
        ERR("Failed to parse response JSON:", parseErr);
        throw new Error(`Server returned non-JSON (status ${response.status}): ${rawText.slice(0, 200)}`);
      }

      LOG("POST /api/analyze parsed result:", result);

      if (!response.ok || !result.success) {
        const msg = result.error || `HTTP ${response.status}`;
        ERR("API returned error:", msg, "requiresUpgrade:", result.requiresUpgrade);
        throw new Error(msg);
      }

      const newScan = result.data;
      LOG("New scan saved — _id:", newScan?._id, "image_url:", newScan?.image_url);

      if (newScan) {
        get().addScanToHistory(newScan);
      } else {
        ERR("result.data was null/undefined even though success=true");
      }

      set({ isLoading: false });
      return newScan;
    } catch (err) {
      ERR("uploadAndAnalyzeScan failed:", err);
      set({ error: err.message || "Failed to analyze image.", isLoading: false });
      return null;
    }
  },

  // Optimistically prepend new scan
  addScanToHistory: (newScan) => {
    LOG("addScanToHistory → _id:", newScan?._id);
    set((state) => ({
      history: [newScan, ...state.history],
      analysisData: newScan,
    }));
  },

  // Clear on logout
  clearAnalysisStore: () => {
    LOG("clearAnalysisStore");
    set({ analysisData: null, history: [], error: null, isLoading: false });
  },
}));