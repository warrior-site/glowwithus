import { create } from "zustand";

export const useIngredientsStore = create((set, get) => ({
  ingredients: [],
  matchedResults: [],
  isLoading: false,
  error: null,

  // 1. FETCH INGREDIENTS FROM BACKEND
  fetchIngredients: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/ingredients");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch ingredients");
      }

      set({ ingredients: data.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 2. ADD INGREDIENT VIA POST REQUEST
  addIngredient: async (ingredientData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ingredientData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add ingredient");
      }

      // Append new ingredient to state array and re-sort alphabetically
      const updatedIngredients = [...get().ingredients, data.data].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      set({ ingredients: updatedIngredients, isLoading: false });
      return { success: true, data: data.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  matchIngredients: async (ingredientNamesArray) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/ingredients/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ names: ingredientNamesArray }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to analyze ingredients");
      }

      const matchedData = Array.isArray(data?.data) ? data.data : [];
      set({ matchedResults: matchedData, isLoading: false });
      return matchedData; // Returns array of matched mongoose documents
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
}));