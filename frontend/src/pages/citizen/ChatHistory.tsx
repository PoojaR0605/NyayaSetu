
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Trash2,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

import Layout from '../../components/layout/Layout';
import { apiClient } from '../../api/client';
import { useSessionStore } from '../../store/sessionStore';

type ChatItem = {
  token: string;
  title: string;
  updatedAt: string;
};

const STORAGE_KEY = 'nyaysetu-chat-history';

function readHistory(): ChatItem[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.token)
      : [];
  } catch {
    return [];
  }
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatItem[]>(readHistory);
  const [busyToken, setBusyToken] = useState('');
  const [error, setError] = useState('');

  const loadConversation = useSessionStore((state) => state.loadConversation);
  const clearSession = useSessionStore((state) => state.clearSession);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  async function reopenChat(chat: ChatItem) {
    setBusyToken(chat.token);
    setError('');

    try {
      await loadConversation(chat.token);

      const state = useSessionStore.getState();
      if (state.error) {
        setError(state.error);
        return;
      }

      navigate(`/assessment?session=${encodeURIComponent(chat.token)}`);
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Could not reopen this chat.');
    } finally {
      setBusyToken('');
    }
  }

  async function deleteChat(chat: ChatItem) {
    if (!window.confirm(`Permanently delete "${chat.title}"?`)) return;

    setBusyToken(chat.token);
    setError('');

    try {
      await apiClient.deleteSession(chat.token);

      setChats((previous) =>
        previous.filter((item) => item.token !== chat.token)
      );

      if (useSessionStore.getState().sessionToken === chat.token) {
        clearSession();
      }
    } catch (err: any) {
      setError(
        err?.detail ||
          err?.message ||
          'Could not delete this conversation. Please try again.'
      );
    } finally {
      setBusyToken('');
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-blue-900"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Chat History
        </h1>
        <p className="mb-6 text-slate-600">
          Reopen or permanently delete a previous conversation.
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
            {error}
          </p>
        )}

        {chats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <MessageSquare
              className="mx-auto mb-3 text-slate-400"
              size={36}
            />
            <h2 className="font-semibold text-slate-800">
              No saved chats yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Start a conversation to see it here.
            </p>
            <Link
              to="/assessment"
              className="mt-5 inline-block rounded-lg bg-blue-900 px-5 py-3 text-white"
            >
              Start a conversation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.token}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    className="mt-1 text-blue-800"
                    size={22}
                  />
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {chat.title || 'Legal conversation'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Last saved:{' '}
                      {chat.updatedAt
                        ? new Date(chat.updatedAt).toLocaleString()
                        : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyToken === chat.token}
                    onClick={() => reopenChat(chat)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Reopen <ExternalLink size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={busyToken === chat.token}
                    onClick={() => deleteChat(chat)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {busyToken === chat.token ? 'Please wait…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
