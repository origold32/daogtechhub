// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "customer" | "admin" | "vendor";

export interface User {
  id:           string;
  firstName:    string;
  lastName:     string;
  email:        string;
  phone?:       string;
  avatar?:      string;
  role?:        UserRole;
  // BUG FIX #3: address fields were missing from the User type.
  // The /api/auth/me endpoint returns them; without them here, PATCH
  // updates couldn't propagate through the store.
  addressLine1?: string;
  addressLine2?: string;
  city?:         string;
  state?:        string;
  country?:      string;
  postalCode?:   string;
}

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  // true while the first Supabase session check is in-flight.
  // Components should check this to avoid flashing stale-persisted state.
  isHydrating:     boolean;

  login:        (user: User) => void;
  logout:       () => void;
  updateUser:   (patch: Partial<User>) => void;
  setHydrating: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      isAuthenticated: false,
      isHydrating:     true,  // starts true; cleared once session check completes

      login:  (user) => set({ user, isAuthenticated: true, isHydrating: false }),
      logout: ()     => set({ user: null, isAuthenticated: false, isHydrating: false }),

      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
      },

      setHydrating: (v) => set({ isHydrating: v }),
    }),
    {
      name: "daog-auth-v2",  // bumped version: old "auth-storage" key had missing fields
      // Only persist user object and auth flag — never persist isHydrating
      partialize: (state) => ({
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
