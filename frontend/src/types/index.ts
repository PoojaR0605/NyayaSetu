// User and Authentication
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Assessment and Session
export interface Assessment {
  id: string;
  user_id?: string;
  session_token: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  legal_domain?: string;
  legal_issue?: string;
  eligibility_status?: 'POTENTIALLY_ELIGIBLE' | 'MAY_BE_ELIGIBLE' | 'MORE_INFO_REQUIRED' | 'NOT_ELIGIBLE';
  preliminary_support_level?: 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT_INFO';
  urgency_level?: 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'POSSIBLE_IMMEDIATE_SAFETY_CONCERN';
  justice_readiness_score?: number;
  information_completeness?: number;
  evidence_readiness?: number;
  created_at: string;
  updated_at: string;
  facts_extracted?: Record<string, any>;
  entities_extracted?: Record<string, any>;
}

export interface Message {
  id: string;
  assessment_id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StartSessionResponse {
  session_token: string;
  assessment_id: string;
  message: string;
}

export interface SendMessageRequest {
  content: string;
  metadata?: Record<string, any>;
}

export interface SendMessageResponse {
  message_id: string;
  assistant_reply: string;
  assessment_updated: boolean;
  follow_up_needed: boolean;
}

export interface Conversation {
  assessment: Assessment | null;
  messages: Message[];
}

// Eligibility
export interface EligibilityCheck {
  id: string;
  assessment_id: string;
  status: 'POTENTIALLY_ELIGIBLE' | 'MAY_BE_ELIGIBLE' | 'MORE_INFO_REQUIRED' | 'NOT_ELIGIBLE';
  matched_rules: string[];
  missing_information: string[];
  explanation: string;
  confidence_score?: number;
  sources?: Record<string, any>;
  created_at: string;
}

// Support Assessment
export interface SupportAssessment {
  id: string;
  assessment_id: string;
  preliminary_support_level: 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT_INFO';
  evidence_readiness: number;
  information_completeness: number;
  timeline_clarity: number;
  jurisdiction_clarity: number;
  issue_clarity: number;
  consistency_score: number;
  justice_readiness_score: number;
  supporting_indicators: string[];
  missing_information: string[];
  explanation: string;
  created_at: string;
}

// Evidence
export interface Evidence {
  id: string;
  assessment_id: string;
  evidence_type: string;
  description: string;
  availability_status: 'AVAILABLE' | 'MISSING' | 'UNKNOWN';
  importance: 'CRITICAL' | 'IMPORTANT' | 'HELPFUL';
  notes?: string;
  created_at: string;
}

// Legal Resources
export interface LegalResource {
  id: string;
  name: string;
  resource_type: 'LEGAL_AID_OFFICE' | 'NGO' | 'PRO_BONO_LAWYER' | 'GOVERNMENT_SCHEME' | 'HELPLINE' | 'ONLINE_RESOURCE';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  languages_supported?: string[];
  legal_domains?: string[];
  eligibility_criteria?: Record<string, any>;
  verification_status: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  is_active: boolean;
}

export interface ResourceSearchRequest {
  legal_domain?: string;
  legal_issue?: string;
  state?: string;
  district?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  resource_type?: string;
  limit?: number;
}

export interface ResourceSearchResult {
  resource: LegalResource;
  relevance_score: number;
  distance_km?: number;
  match_reasons: string[];
}

// Action Plan
export interface ActionItem {
  id: string;
  assessment_id: string;
  title: string;
  description: string;
  priority: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  category?: string;
  deadline?: string;
  created_at: string;
}

// Admin Analytics
export interface AdminDashboardStats {
  total_assessments: number;
  completed_assessments: number;
  active_assessments: number;
  potentially_eligible: number;
  urgent_cases: number;
  common_legal_domains: Array<{ domain: string; count: number }>;
  referrals_made: number;
}

// API Error Response
export interface ApiError {
  detail: string;
  status_code?: number;
}

// Common UI States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
