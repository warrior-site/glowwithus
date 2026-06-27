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
      set({ currentUser: data.user || data, isLoading: false, users:data.user });
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
      set({ currentUser: data.user, isLoading: false,users:data.user  });
      console.log(currentUser,users)
    } catch (err) {
      set({ error: err.message || 'Something went wrong', isLoading: false });
    }
  },

  // --- 4. ACTION: UPDATE EXISTING PROFILE (PUT Route Sync) ---
  updateUserProfile: async (profileUpdates) => {
    set({ isSubmitting: true, error: null });
    try {
      // Points directly to the location of your profile route handler
      const res = await fetch('/api/profile', { 
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
  addUserProfile: async (formData, profilePhoto, receiptPhoto) => {
    set({ isSubmitting: true, error: null });
    try {
      let avatarUrl = '';
      let affiliate_receipt_url = '';

      const getFreshAuth = async () => {
        const authRes = await fetch('/api/imagekit-auth');
        if (!authRes.ok) throw new Error('Failed to get fresh ImageKit authorization');
        return authRes.json();
      };

      if (profilePhoto) {
        const authData = await getFreshAuth();
        const uploadResponse = await imagekit.upload({
          file: profilePhoto,
          fileName: profilePhoto.name,
          signature: authData.signature,
          token: authData.token,
          expire: authData.expire,
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
        });
        avatarUrl = uploadResponse.url;
      }

      if (receiptPhoto) {
        const authData = await getFreshAuth(); 
        const uploadResponseReceipt = await imagekit.upload({
          file: receiptPhoto,
          fileName: receiptPhoto.name,
          signature: authData.signature,
          token: authData.token,
          expire: authData.expire,
          publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
        });
        affiliate_receipt_url = uploadResponseReceipt.url;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          avatarUrl, 
          affiliate_receipt_url
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create user profile');
      const newUser = await res.json();

      set((state) => ({ 
        users: [...state.users, newUser], 
        isSubmitting: false 
      }));
      
      return true;
    } catch (err) {
      set({ error: err.message || 'Failed to save profile', isSubmitting: false });
      return false;
    }
  }
}));