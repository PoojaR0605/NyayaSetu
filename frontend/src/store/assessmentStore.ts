import { create } from 'zustand';
import type { 
  Assessment, 
  EligibilityCheck, 
  SupportAssessment, 
  Evidence,
  ActionItem,
  ResourceSearchResult
} from '../types';
import { apiClient } from '../api/client';

interface AssessmentState {
  currentAssessment: Assessment | null;
  eligibility: EligibilityCheck | null;
  supportAssessment: SupportAssessment | null;
  evidence: Evidence[];
  actionPlan: ActionItem[];
  recommendedResources: ResourceSearchResult[];
  savedAssessments: Assessment[];
  
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadAssessment: (sessionToken: string) => Promise<void>;
  loadEligibility: (sessionToken: string) => Promise<void>;
  loadSupportAssessment: (sessionToken: string) => Promise<void>;
  loadEvidence: (assessmentId: string) => Promise<void>;
  loadActionPlan: (assessmentId: string) => Promise<void>;
  loadRecommendedResources: (sessionToken: string) => Promise<void>;
  loadSavedAssessments: () => Promise<void>;
  updateActionItemStatus: (itemId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => Promise<void>;
  deleteAssessment: (assessmentId: string) => Promise<void>;
  clearCurrentAssessment: () => void;
  clearError: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentAssessment: null,
  eligibility: null,
  supportAssessment: null,
  evidence: [],
  actionPlan: [],
  recommendedResources: [],
  savedAssessments: [],
  isLoading: false,
  error: null,

  loadAssessment: async (sessionToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const assessment = await apiClient.getAssessment(sessionToken);
      set({ 
        currentAssessment: assessment, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load assessment', 
        isLoading: false 
      });
    }
  },

  loadEligibility: async (sessionToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const eligibility = await apiClient.getEligibility(sessionToken);
      set({ 
        eligibility, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load eligibility', 
        isLoading: false 
      });
    }
  },

  loadSupportAssessment: async (sessionToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const supportAssessment = await apiClient.getSupportAssessment(sessionToken);
      set({ 
        supportAssessment, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load support assessment', 
        isLoading: false 
      });
    }
  },

  loadEvidence: async (assessmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const evidence = await apiClient.getEvidence(assessmentId);
      set({ 
        evidence, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load evidence', 
        isLoading: false 
      });
    }
  },

  loadActionPlan: async (assessmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const actionPlan = await apiClient.getActionPlan(assessmentId);
      set({ 
        actionPlan, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load action plan', 
        isLoading: false 
      });
    }
  },

  loadRecommendedResources: async (sessionToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const resources = await apiClient.getResourceRecommendations(sessionToken);
      set({ 
        recommendedResources: resources, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load resources', 
        isLoading: false 
      });
    }
  },

  loadSavedAssessments: async () => {
    set({ isLoading: true, error: null });
    try {
      const assessments = await apiClient.getUserAssessments();
      set({ 
        savedAssessments: assessments, 
        isLoading: false,
        error: null 
      });
    } catch (error: any) {
      set({ 
        error: error.detail || 'Failed to load saved assessments', 
        isLoading: false 
      });
    }
  },

  updateActionItemStatus: async (itemId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      const updatedItem = await apiClient.updateActionItem(itemId, status);
      set(state => ({
        actionPlan: state.actionPlan.map(item =>
          item.id === itemId ? updatedItem : item
        ),
      }));
    } catch (error: any) {
      set({ error: error.detail || 'Failed to update action item' });
      throw error;
    }
  },

  deleteAssessment: async (assessmentId: string) => {
    try {
      await apiClient.deleteAssessment(assessmentId);
      set(state => ({
        savedAssessments: state.savedAssessments.filter(a => a.id !== assessmentId),
      }));
    } catch (error: any) {
      set({ error: error.detail || 'Failed to delete assessment' });
      throw error;
    }
  },

  clearCurrentAssessment: () => {
    set({
      currentAssessment: null,
      eligibility: null,
      supportAssessment: null,
      evidence: [],
      actionPlan: [],
      recommendedResources: [],
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
