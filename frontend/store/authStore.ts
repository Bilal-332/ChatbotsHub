import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, PlanExpiryWarning } from '@appTypes/index';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  /** True once persisted auth has been read from localStorage on the client. */
  hasHydrated: boolean;
  planExpiryWarning: PlanExpiryWarning | null;
  impersonation: {
    accessToken: string;
    refreshToken: string;
    organizationId: string;
  } | null;
  setHasHydrated: (value: boolean) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string, planExpiryWarning?: PlanExpiryWarning | null) => void;
  setPlanExpiryWarning: (warning: PlanExpiryWarning | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  startImpersonation: (tokens: { accessToken: string; refreshToken: string }, organizationId: string) => void;
  stopImpersonation: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      planExpiryWarning: null,
      impersonation: null,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setAuth: (user, accessToken, refreshToken, planExpiryWarning = null) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, impersonation: null, planExpiryWarning }),

      setPlanExpiryWarning: (planExpiryWarning) => set({ planExpiryWarning }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      updateUser: (user) => set({ user }),

      startImpersonation: (tokens, organizationId) =>
        set((state) => {
          if (!state.user || !state.accessToken || !state.refreshToken || state.impersonation) {
            return state;
          }

          return {
            impersonation: {
              accessToken: state.accessToken,
              refreshToken: state.refreshToken,
              organizationId: state.user.organizationId,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
              ...state.user,
              organizationId,
            },
          };
        }),

      stopImpersonation: () =>
        set((state) => {
          if (!state.impersonation || !state.user) {
            return state;
          }

          return {
            accessToken: state.impersonation.accessToken,
            refreshToken: state.impersonation.refreshToken,
            user: {
              ...state.user,
              organizationId: state.impersonation.organizationId,
            },
            impersonation: null,
          };
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          impersonation: null,
          planExpiryWarning: null,
        }),
    }),
    {
      name: 'chatbotshub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        impersonation: state.impersonation,
      }),
      onRehydrateStorage: () => (state) => {
        // Never restore expiry warning from storage — dashboard derives it from org API
        if (state) {
          state.planExpiryWarning = null;
          // Mark hydration complete so route guards don't redirect before
          // persisted tokens are read back from localStorage on refresh.
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
