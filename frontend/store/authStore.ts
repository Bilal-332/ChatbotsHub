import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@appTypes/index';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  impersonation: {
    accessToken: string;
    refreshToken: string;
    organizationId: string;
  } | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
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
      impersonation: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, impersonation: null }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

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
    },
  ),
);
