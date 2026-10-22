
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  StartSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  Conversation,
  Assessment,
  EligibilityCheck,
  SupportAssessment,
  Evidence,
  ResourceSearchRequest,
  ResourceSearchResult,
  ActionItem,
  AdminDashboardStats,
  ApiError,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// ===== BACKEND RESPONSE TYPES =====

type BackendConversationMessage = {
  id: string;
  role: string;
  content: string;
  content_translated?: string | null;
  detected_language?: string | null;
  sequence?: number;
  created_at: string;
};

type BackendConversation = {
  session_id?: string;
  assessment_id?: string;
  assessment?: Assessment;
  messages: BackendConversationMessage[];
  total_messages?: number;
};

// ===== NEARBY LAWYERS =====

export type NearbyLawyer = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  phone: string | null;
  website: string | null;
  distance_m: number;
  source_url: string;
  source: string;
  is_sample?: boolean;
  verification_notice?: string;
};

export type NearbyLawyerSearchResponse = {
  center: {
    lat: number;
    lon: number;
    label: string;
  };
  radius_m: number;
  count: number;
  lawyers: NearbyLawyer[];
  source: string;
  attribution: string | null;
  notice: string;
  is_demo?: boolean;
  source_unavailable?: boolean;
};

// ===== API CLIENT =====

class ApiClient {
  private client: AxiosInstance;
  private tokenKey = 'nyaysetu_access_token';

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.clearToken();

          // Avoid redirect loops on the login page.
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?expired=true';
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data?.detail) {
      return {
        detail: error.response.data.detail,
        status_code: error.response.status,
      };
    }

    if (error.message === 'Network Error') {
      return {
        detail:
          'Unable to connect to the server. Check that the backend is running and that the API URL is correct.',
        status_code: 0,
      };
    }

    return {
      detail: error.message || 'An unexpected error occurred.',
      status_code: error.response?.status,
    };
  }

  // ===== TOKEN MANAGEMENT =====

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  // ===== HEALTH CHECK =====

  async checkHealth(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // ===== AUTHENTICATION =====

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/api/v1/auth/login',
      {
        username: data.email.trim().toLowerCase(),
        password: data.password,
      },
    );

    this.setToken(response.data.access_token);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/api/v1/auth/register',
      data,
    );

    this.setToken(response.data.access_token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/v1/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // ===== ASSESSMENT & CONVERSATION =====

  async startSession(): Promise<StartSessionResponse> {
    const response = await this.client.post<StartSessionResponse>(
      '/api/v1/sessions/start',
      {
        language: 'en',
        user_type: 'citizen',
      },
    );

    return response.data;
  }

  async sendMessage(
    sessionToken: string,
    data: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    const response = await this.client.post<{
      id?: string;
      message_id?: string;
      content?: string;
      assistant_reply?: string;
      assessment_updated?: boolean;
      follow_up_needed?: boolean;
    }>(
      `/api/v1/sessions/${encodeURIComponent(sessionToken)}/messages`,
      data,
    );

    const result = response.data;

    return {
      message_id: result.message_id ?? result.id ?? '',
      assistant_reply: result.assistant_reply ?? result.content ?? '',
      assessment_updated: result.assessment_updated ?? false,
      follow_up_needed: result.follow_up_needed ?? true,
    };
  }

  async getConversation(
    sessionToken: string,
  ): Promise<Conversation> {
    const response = await this.client.get<BackendConversation>(
      `/api/v1/sessions/${encodeURIComponent(sessionToken)}/conversation`,
    );

    const data = response.data;

    // Convert backend role names into the frontend's expected format.
    const messages = (data.messages ?? []).map((message) => ({
      id: message.id,
      assessment_id:
        data.assessment_id ?? data.session_id ?? sessionToken,
      role: message.role.toUpperCase() as
        | 'USER'
        | 'ASSISTANT'
        | 'SYSTEM',
      content: message.content_translated || message.content,
      created_at: message.created_at,
    }));

    // An assessment may not exist yet for new sessions.
    // Treat a 404 as a missing assessment so the conversation still loads.
    let assessment = data.assessment ?? null;

    if (!assessment) {
      try {
        assessment = await this.getAssessment(sessionToken);
      } catch (err: unknown) {
        const error = err as {
          status_code?: number;
          response?: { status?: number };
        };

        const status =
          error.status_code ?? error.response?.status;

        if (status !== 404) {
          // Unexpected network or server errors should propagate.
          throw err;
        }

        assessment = null;
      }
    }

    return {
      assessment,
      messages,
    } as Conversation;
  }

  
  async getCaseStrength(
    sessionToken: string,
  ): Promise<{
    analysis: string;
    recommendation: string;
    disclaimer: string;
  }> {
    const response = await this.client.get<{
      analysis: string;
      recommendation: string;
      disclaimer: string;
    }>(
      `/api/v1/sessions/${encodeURIComponent(sessionToken)}/case-strength`,
      {
        // Local Ollama may need more time for a detailed case review.
        // This override applies only to Case Strength.
        timeout: 180000,
      },
    );

    return response.data;
  }


  async deleteSession(sessionToken: string): Promise<void> {
    await this.client.delete(
      `/api/v1/sessions/${encodeURIComponent(sessionToken)}`,
    );
  }

  async endSession(sessionToken: string): Promise<void> {
    await this.client.post(
      `/api/v1/sessions/${encodeURIComponent(sessionToken)}/close`,
    );
  }

  async getAssessment(sessionToken: string): Promise<Assessment> {
    const response = await this.client.get<Assessment>(
      `/api/v1/assessments/${encodeURIComponent(sessionToken)}`,
    );

    return response.data;
  }

  async createAssessment(
    sessionToken: string,
  ): Promise<Assessment> {
    const response = await this.client.post<Assessment>(
      `/api/v1/assessments/create/${encodeURIComponent(sessionToken)}`,
    );

    return response.data;
  }

  async getUserAssessments(): Promise<Assessment[]> {
    const response = await this.client.get<Assessment[]>(
      '/api/v1/assessments/user/me',
    );

    return response.data;
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    await this.client.delete(
      `/api/v1/assessments/${encodeURIComponent(assessmentId)}`,
    );
  }

  // ===== ELIGIBILITY =====

  async getEligibility(
    sessionToken: string,
  ): Promise<EligibilityCheck> {
    const response = await this.client.get<EligibilityCheck>(
      `/api/v1/eligibility/check/${encodeURIComponent(sessionToken)}`,
    );

    return response.data;
  }

  // ===== SUPPORT ASSESSMENT =====

  async getSupportAssessment(
    sessionToken: string,
  ): Promise<SupportAssessment> {
    const response = await this.client.get<SupportAssessment>(
      `/api/v1/support/assess/${encodeURIComponent(sessionToken)}`,
    );

    return response.data;
  }

  // ===== EVIDENCE =====

  async getEvidence(assessmentId: string): Promise<Evidence[]> {
    const response = await this.client.get<Evidence[]>(
      `/api/v1/evidence/assessment/${encodeURIComponent(assessmentId)}`,
    );

    return response.data;
  }

  async uploadDocument(
    assessmentId: string,
    file: File,
  ): Promise<{ document_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<{
      document_id: string;
    }>(
      `/api/v1/evidence/upload/${encodeURIComponent(assessmentId)}`,
      formData,
    );

    return response.data;
  }

  // ===== LEGAL RESOURCES =====

  async searchResources(
    params: ResourceSearchRequest,
  ): Promise<ResourceSearchResult[]> {
    const response = await this.client.post<ResourceSearchResult[]>(
      '/api/v1/legal-resources/search',
      params,
    );

    return response.data;
  }

  async getResourceRecommendations(
    sessionToken: string,
  ): Promise<ResourceSearchResult[]> {
    const response = await this.client.get<
      ResourceSearchResult['resource'][]
    >(
      `/api/v1/legal-resources/recommend/${encodeURIComponent(sessionToken)}`,
    );

    return response.data.map((resource) => ({
      resource,
      relevance_score: 0,
      match_reasons: [],
    }));
  }

  // ===== ACTION PLAN =====

  async getActionPlan(
    assessmentId: string,
  ): Promise<ActionItem[]> {
    const response = await this.client.get<ActionItem[]>(
      `/api/v1/actions/plan/${encodeURIComponent(assessmentId)}`,
    );

    return response.data;
  }

  async updateActionItem(
    itemId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
  ): Promise<ActionItem> {
    const response = await this.client.patch<ActionItem>(
      `/api/v1/actions/${encodeURIComponent(itemId)}`,
      { status },
    );

    return response.data;
  }

  // ===== ADMIN =====

  async getAdminDashboard(): Promise<AdminDashboardStats> {
    const response = await this.client.get<AdminDashboardStats>(
      '/api/v1/admin/dashboard',
    );

    return response.data;
  }

  async getAllAssessments(): Promise<Assessment[]> {
    const response = await this.client.get<Assessment[]>(
      '/api/v1/admin/assessments',
    );

    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>(
      '/api/v1/admin/users',
    );

    return response.data;
  }

  // ===== NEARBY LAWYERS =====

  async searchNearbyLawyers(params: {
    location?: string;
    lat?: number;
    lon?: number;
    radius_m?: number;
  }): Promise<NearbyLawyerSearchResponse> {
    const response =
      await this.client.get<NearbyLawyerSearchResponse>(
        '/api/v1/nearby-lawyers/search',
        { params },
      );

    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
