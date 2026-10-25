
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { apiClient } from '../api/client';
import { useSessionStore } from './sessionStore';
import { useAssessmentStore } from './assessmentStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.login(credentials);

          // Prevent a previous account's active chat from carrying over.
          useSessionStore.getState().clearSession();
          useAssessmentStore.getState().clearCurrentAssessment();

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error:
              error?.detail ||
              error?.message ||
              'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });

          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.register(data);

          useSessionStore.getState().clearSession();
          useAssessmentStore.getState().clearCurrentAssessment();

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error:
              error?.detail ||
              error?.message ||
              'Registration failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });

          throw error;
        }
      },

      logout: () => {
        // Clear the active conversation from browser state.
        useSessionStore.getState().clearSession();

        // Clear the current assessment and related data.
        useAssessmentStore.getState().clearCurrentAssessment();

        // Clear authentication credentials.
        apiClient.logout();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      fetchCurrentUser: async () => {
        if (!apiClient.isAuthenticated()) {
          useSessionStore.getState().clearSession();
          useAssessmentStore.getState().clearCurrentAssessment();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          return;
        }

        set({ isLoading: true, error: null });

        try {
          const user = await apiClient.getCurrentUser();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          apiClient.clearToken();

          useSessionStore.getState().clearSession();
          useAssessmentStore.getState().clearCurrentAssessment();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nyaysetu-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
