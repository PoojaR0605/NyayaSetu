
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message, SendMessageRequest } from '../types';
import { apiClient } from '../api/client';
import { useAuthStore } from './authStore';

export const CHAT_HISTORY_KEY = 'nyaysetu-chat-history';

interface ChatHistoryItem {
  token: string;
  title: string;
  updatedAt: string;
  ownerKey?: string;
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
  sendMessage: (
    content: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  loadConversation: (tokenOverride?: string) => Promise<void>;
  endSession: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

function getOwnerKey(): string {
  const user = useAuthStore.getState().user;

  if (!user) return 'anonymous';

  // Prefer a stable account identifier, never an access token.
  const account = user as UserWithIdentity;
  return String(
    account.id ??
    account.email ??
    account.username ??
    'authenticated-user'
  );
}

interface UserWithIdentity {
  id?: string | number;
  email?: string;
  username?: string;
}

function saveHistoryItem(token: string, title: string) {
  try {
    const ownerKey = getOwnerKey();
    const history: ChatHistoryItem[] = JSON.parse(
      localStorage.getItem(CHAT_HISTORY_KEY) || '[]'
    );

    const previous = history.find(
      item => item.token === token && item.ownerKey === ownerKey
    );

    const next: ChatHistoryItem[] = [
      {
        token,
        ownerKey,
        title:
          title.trim() && title !== 'Legal conversation'
            ? title.trim().slice(0, 65)
            : previous?.title || 'Legal conversation',
        updatedAt: new Date().toISOString(),
      },
      ...history.filter(
        item => !(item.token === token && item.ownerKey === ownerKey)
      ),
    ];

    localStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify(next.slice(0, 100))
    );
  } catch (error) {
    console.error('Could not save chat history:', error);
  }
}

function emptySession() {
  return {
    sessionToken: null,
    assessmentId: null,
    messages: [] as Message[],
    isLoading: false,
    isSending: false,
    error: null,
    detectedDomain: null,
    urgencyLevel: null,
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...emptySession(),

      startNewSession: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.startSession();
          const token = response.session_token;

          if (!token) {
            throw new Error('The server did not return a session token.');
          }

          const welcomeMessage: Message = {
            id: 'initial',
            assessment_id: response.assessment_id || '',
            role: 'ASSISTANT',
            content:
              response.message ||
              'Namaste. Please describe your legal matter, including relevant dates and documents.',
            created_at: new Date().toISOString(),
          };

          set({
            sessionToken: token,
            assessmentId: response.assessment_id || null,
            messages: [welcomeMessage],
            isLoading: false,
            isSending: false,
            error: null,
            detectedDomain: null,
            urgencyLevel: null,
          });

          saveHistoryItem(token, 'Legal conversation');
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.detail ||
              error?.message ||
              'Failed to start a new assessment.',
          });
          throw error;
        }
      },

      sendMessage: async (content, metadata) => {
        const token = get().sessionToken;

        if (!token) {
          set({
            error: 'No active session. Please start a new assessment.',
          });
          return;
        }

        if (!content.trim()) return;

        set({ isSending: true, error: null });

        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          assessment_id: get().assessmentId || '',
          role: 'USER',
          content,
          metadata,
          created_at: new Date().toISOString(),
        };

        set(state => ({
          messages: [...state.messages, userMessage],
        }));

        try {
          const request: SendMessageRequest = { content, metadata };
          const response = await apiClient.sendMessage(token, request);

          const firstUserMessage = get().messages.find(
            message => message.role === 'USER'
          );

          saveHistoryItem(
            token,
            firstUserMessage?.content || content
          );

          const assistantMessage: Message = {
            id: response.message_id || `assistant-${Date.now()}`,
            assessment_id: get().assessmentId || '',
            role: 'ASSISTANT',
            content: response.assistant_reply,
            created_at: new Date().toISOString(),
          };

          set(state => ({
            messages: [...state.messages, assistantMessage],
            isSending: false,
            error: null,
          }));

          if (response.assessment_updated) {
            await get().loadConversation(token);
          }
        } catch (error: any) {
          set(state => ({
            messages: state.messages.filter(
              message => message.id !== userMessage.id
            ),
            isSending: false,
            error:
              error?.detail ||
              error?.message ||
              'Failed to send message.',
          }));

          throw error;
        }
      },

      loadConversation: async tokenOverride => {
        const token = tokenOverride || get().sessionToken;

        if (!token) {
          set({
            error: 'Select a saved conversation or start a new assessment.',
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const conversation = await apiClient.getConversation(token);

          set({
            sessionToken: token,
            messages: conversation.messages || [],
            assessmentId: conversation.assessment?.id || null,
            detectedDomain:
              conversation.assessment?.legal_domain || null,
            urgencyLevel:
              conversation.assessment?.urgency_level || null,
            isLoading: false,
            error: null,
          });

          const firstUserMessage = (conversation.messages || []).find(
            (message: Message) => message.role === 'USER'
          );

          saveHistoryItem(
            token,
            firstUserMessage?.content || 'Legal conversation'
          );
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.detail ||
              error?.message ||
              'Could not load this conversation. It may have expired.',
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
        set(emptySession());
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nyaysetu-session',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        sessionToken: state.sessionToken,
        assessmentId: state.assessmentId,
        messages: state.messages,
        detectedDomain: state.detectedDomain,
        urgencyLevel: state.urgencyLevel,
      }),
    }
  )
);
