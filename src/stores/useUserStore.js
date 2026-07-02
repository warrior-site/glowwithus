import { create } from 'zustand';
import ImageKit from 'imagekit-javascript';
import { Users } from 'lucide-react';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '',
});

export const useUserStore = create((set, get) => ({
  // --- 1. INITIAL STATE --- 
  users: [],
  currentUser: null, // Stores logged-in user details/session data
  isLoading: false,
  isSubmitting: false,
  error: null,

  // --- 2. ACTION: USER LOGIN ---
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await res.json();
      set({ currentUser: data.user || data, isLoading: false, users: data.user });
      return true;
    } catch (err) {
      set({ error: err.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  // ACTION: LOGOUT
  logout: () => set({ currentUser: null, users: [] }),

  // --- 3. ACTION: FETCH DATA ---
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch data from backend');

      const data = await res.json();
      set({ currentUser: data.user, isLoading: false, users: data.user });
      console.log(currentUser, users)
    } catch (err) {
      set({ error: err.message || 'Something went wrong', isLoading: false });
    }
  },

  // --- 4. ACTION: UPDATE EXISTING PROFILE (PUT Route Sync) ---
  updateUserProfile: async (profileUpdates) => {
    set({ isSubmitting: true, error: null });
    try {
      // Points directly to the location of your profile route handler
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileUpdates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user profile');
      }

      // Sync frontend global state with structural modifications from DB
      set({
        currentUser: data.user,
        isSubmitting: false
      });

      return { success: true, message: data.message };
    } catch (err) {
      set({ error: err.message || 'Failed to save profile modifications', isSubmitting: false });
      return { success: false, error: err.message };
    }
  },

  // --- 5. ACTION: MULTI-UPLOAD + CREATE PROFILE ---
  addUserProfile: async (formData, profilePhoto) => {
    set({ isSubmitting: true, error: null });

    try {
      let avatarUrl = "";
      console.log("click3")
      if (profilePhoto) {
        const authRes = await fetch("/api/imagekit-auth");
        const authData = await authRes.json();
        console.log("IMAGEKIT RAW:", authData);


        const upload = await imagekit.upload({
          file: profilePhoto,
          fileName: profilePhoto.name,
          ...authData,
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        });

        avatarUrl = upload.url;
      }
      console.log("click4")
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, avatarUrl }),
      });

      let result;

      try {
        result = await res.json();
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      if (!res.ok) {
        console.error("🔥 FULL BACKEND ERROR:", result); // 👈 THIS IS KEY
        throw new Error(result?.message || "Registration failed");
      }

      return result;
      set({ isSubmitting: false });
      return true;
    } catch (err) {
      console.error("UPLOAD ERROR:", err); // 👈 ADD THIS
      set({ error: err.message, isSubmitting: false });
      return false;
    }
  }
}));