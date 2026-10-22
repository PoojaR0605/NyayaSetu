
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, SendMessageRequest } from '../types';
import { apiClient } from '../api/client';

export const CHAT_HISTORY_KEY = 'nyaysetu-chat-history';

interface ChatHistoryItem {
  token: string;
  title: string;
  updatedAt: string;
}

function saveHistoryItem(token: string, title: string) {
  try {
    const history: ChatHistoryItem[] = JSON.parse(
      localStorage.getItem(CHAT_HISTORY_KEY) || '[]'
    );

    const previous = history.find((item) => item.token === token);
    const next: ChatHistoryItem[] = [
      {
        token,
        title:
          title.trim() && title !== 'Legal conversation'
            ? title.trim().slice(0, 65)
            : previous?.title || 'Legal conversation',
        updatedAt: new Date().toISOString(),
      },
      ...history.filter((item) => item.token !== token),
    ];

    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(next.slice(0, 100)));
  } catch (error) {
    console.error('Could not save chat history:', error);
  }
}

interface SessionState {
  sessionToken: string | null;
  assessmentId: string | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  detectedDomain: string | null;
  urgencyLevel: string | null;
  startNewSession: () => Promise<void>;
  sendMessage: (content: string, metadata?: Record<string, any>) => Promise<void>;
  loadConversation: (tokenOverride?: string) => Promise<void>;
  endSession: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionToken: null,
      assessmentId: null,
      messages: [],
      isLoading: false,
      isSending: false,
      error: null,
      detectedDomain: null,
      urgencyLevel: null,

      startNewSession: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.startSession();
          const token = response.session_token;
          const welcomeMessage =
            response.message ||
            "Namaste. Please describe your legal matter, including relevant dates and documents.";

          const systemMessage: Message = {
            id: 'initial',
            assessment_id: response.assessment_id || '',
            role: 'ASSISTANT',
            content: welcomeMessage,
            created_at: new Date().toISOString(),
          };

          set({
            sessionToken: token,
            assessmentId: response.assessment_id || null,
            messages: [systemMessage],
            isLoading: false,
            isSending: false,
            error: null,
            detectedDomain: null,
            urgencyLevel: null,
          });

          saveHistoryItem(token, 'Legal conversation');
        } catch (error: any) {
          set({
            error: error?.detail || error?.message || 'Failed to start session',
            isLoading: false,
          });
          throw error;
        }
      },

      sendMessage: async (content, metadata) => {
        const { sessionToken } = get();

        if (!sessionToken) {
          set({ error: 'No active session. Please start a conversation.' });
          return;
        }

        set({ isSending: true, error: null });

        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          assessment_id: get().assessmentId || '',
          role: 'USER',
          content,
          metadata,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
        }));

        try {
          const request: SendMessageRequest = { content, metadata };
          const response = await apiClient.sendMessage(sessionToken, request);

          const title =
            get().messages.find((message) => message.role === 'USER')?.content ||
            content;

          saveHistoryItem(sessionToken, title);

          const assistantMessage: Message = {
            id: response.message_id || `assistant-${Date.now()}`,
            assessment_id: get().assessmentId || '',
            role: 'ASSISTANT',
            content: response.assistant_reply,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isSending: false,
            error: null,
          }));

          if (response.assessment_updated) {
            await get().loadConversation();
          }
        } catch (error: any) {
          set((state) => ({
            messages: state.messages.filter(
              (message) => message.id !== userMessage.id
            ),
            error: error?.detail || error?.message || 'Failed to send message',
            isSending: false,
          }));
          throw error;
        }
      },

      loadConversation: async (tokenOverride) => {
        const token = tokenOverride || get().sessionToken;
        if (!token) return;

        set({ isLoading: true, error: null });

        try {
          // Ensure the selected token becomes the active session.
          set({ sessionToken: token });

          const conversation = await apiClient.getConversation(token);

          set({
            sessionToken: token,
            messages: conversation.messages || [],
            assessmentId: conversation.assessment?.id || null,
            detectedDomain: conversation.assessment?.legal_domain || null,
            urgencyLevel: conversation.assessment?.urgency_level || null,
            isLoading: false,
            error: null,
          });

          saveHistoryItem(token, 'Legal conversation');
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.detail ||
              error?.message ||
              'Could not load this conversation.',
          });
        }
      },

      endSession: async () => {
        const token = get().sessionToken;
        if (!token) return;

        try {
          await apiClient.endSession(token);
        } catch (error) {
          console.error('Failed to end session on backend:', error);
        }
      },

      clearSession: () => {
        set({
          sessionToken: null,
          assessmentId: null,
          messages: [],
          isLoading: false,
          isSending: false,
          error: null,
          detectedDomain: null,
          urgencyLevel: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nyaysetu-session',
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        assessmentId: state.assessmentId,
        messages: state.messages,
        detectedDomain: state.detectedDomain,
        urgencyLevel: state.urgencyLevel,
      }),
    }
  )
);
