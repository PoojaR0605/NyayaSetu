
import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Scale,
  FileText,
  CheckCircle,
  ScanText,
} from 'lucide-react';

import { useSessionStore } from '../../store/sessionStore';
import { apiClient } from '../../api/client';
import { useAssessmentStore } from '../../store/assessmentStore';
import Layout from '../../components/layout/Layout';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import AssessmentProgress from '../../components/chat/AssessmentProgress';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

interface DocumentReviewResult {
  filename: string;
  content_type: string;
  size_bytes: number;
  extracted_text: string;
  review_status: string;
  message: string;
  next_steps: string[];
}

interface UploadedDocument {
  id: string;
  result: DocumentReviewResult;
}

interface CaseStrengthResponse {
  analysis: string;
  recommendation?: string;
  disclaimer?: string;
}

// Use the same base URL as the shared API client so all requests target
// the same backend regardless of how VITE_API_BASE_URL is set.
const API_BASE_URL =
  (import.meta.env as Record<string, string>).VITE_API_BASE_URL ||
  'http://localhost:8000';

function getApiErrorMessage(err: unknown): string {
  const error = err as {
    response?: {
      status?: number;
      data?: { detail?: unknown; message?: unknown };
    };
    detail?: string;
    message?: string;
    status_code?: number;
  };

  const statusCode =
    error.response?.status ?? error.status_code;

  const detail =
    error.response?.data?.detail ??
    error.response?.data?.message ??
    error.detail ??
    error.message;

  let message =
    typeof detail === 'string'
      ? detail
      : detail
        ? JSON.stringify(detail)
        : 'An unexpected error occurred.';

  if (statusCode === 404) {
    message = `The session or case-review endpoint was not found. ${message}`;
  } else if (statusCode === 503) {
    message = `The AI service could not generate the review. Check that Ollama is running. ${message}`;
  }

  return message;
}

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedSession = searchParams.get('session');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedSessionRef = useRef<string | null>(null);

  const [uploadedDocuments, setUploadedDocuments] =
    useState<UploadedDocument[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const [caseStrengthReport, setCaseStrengthReport] = useState('');
  const [caseStrengthLoading, setCaseStrengthLoading] = useState(false);
  const [caseStrengthError, setCaseStrengthError] = useState('');

  const {
    sessionToken,
    messages,
    isLoading,
    isSending,
    error,
    detectedDomain,
    urgencyLevel,
    startNewSession,
    sendMessage,
    loadConversation,
    clearError,
    clearSession,
  } = useSessionStore();

  const { loadAssessment } = useAssessmentStore();

  // Restore the selected chat, or start a new session when no token is requested.
  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      if (requestedSession) {
        if (initializedSessionRef.current === requestedSession) return;

        initializedSessionRef.current = requestedSession;
        setCaseStrengthReport('');
        setCaseStrengthError('');
        setUploadedDocuments([]);

        try {
          await loadConversation(requestedSession);

          if (cancelled) return;

          const state = useSessionStore.getState();

          if (
            state.sessionToken !== requestedSession ||
            state.error
          ) {
            initializedSessionRef.current = null;
            setCaseStrengthError(
              state.error || 'Could not reopen the selected conversation.'
            );
          }
        } catch (err) {
          if (!cancelled) {
            initializedSessionRef.current = null;
            setCaseStrengthError(getApiErrorMessage(err));
          }
        }

        return;
      }

      const currentToken = useSessionStore.getState().sessionToken;

      if (currentToken) {
        if (initializedSessionRef.current === currentToken) return;

        initializedSessionRef.current = currentToken;

        if (useSessionStore.getState().messages.length === 0) {
          await loadConversation(currentToken);
        }

        return;
      }

      if (initializedSessionRef.current === 'starting') return;

      initializedSessionRef.current = 'starting';

      try {
        clearError();
        await startNewSession();

        if (!cancelled) {
          initializedSessionRef.current =
            useSessionStore.getState().sessionToken;
        }
      } catch (err) {
        if (!cancelled) {
          initializedSessionRef.current = null;
          console.error('Failed to start session:', err);
        }
      }
    }

    void initializeSession();

    return () => {
      cancelled = true;
    };
  }, [
    requestedSession,
    sessionToken,
    startNewSession,
    loadConversation,
    clearError,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, uploadedDocuments]);

  const hasSafetyConcern =
    urgencyLevel === 'POSSIBLE_IMMEDIATE_SAFETY_CONCERN';

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
      setCaseStrengthReport('');
      setCaseStrengthError('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleUploadDocument = async (file: File): Promise<void> => {
    setUploadingDocument(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_BASE_URL.replace(/\/$/, '')}/api/v1/documents/analyze`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        let message = `Upload failed (${response.status}).`;

        try {
          const body = await response.json();

          if (typeof body.detail === 'string') {
            message = body.detail;
          } else if (typeof body.message === 'string') {
            message = body.message;
          }
        } catch {
          // Keep the fallback message.
        }

        throw new Error(message);
      }

      const result =
        (await response.json()) as DocumentReviewResult;

      setUploadedDocuments((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${file.name}`,
          result,
        },
      ]);
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          'Cannot connect to the document service. Check that the backend is running.'
        );
      }

      throw err instanceof Error
        ? err
        : new Error('Unable to upload this document.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleViewResults = async () => {
    if (!sessionToken) return;

    try {
      await loadAssessment(sessionToken);
      navigate(`/results/${encodeURIComponent(sessionToken)}`);
    } catch (err) {
      console.error('Could not load assessment results:', err);
    }
  };

  const handleEndSession = async () => {
    if (
      !sessionToken ||
      !window.confirm(
        'End this session? The conversation will remain in your chat history unless you delete it.'
      )
    ) {
      return;
    }

    try {
      await useSessionStore.getState().endSession();
      clearSession();
      initializedSessionRef.current = null;
      navigate('/');
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  const handleReviewCaseStrength = async () => {
    if (!sessionToken) {
      setCaseStrengthError(
        'There is no active session. Please start a new assessment.'
      );
      return;
    }

    if (!messages.some((message) => message.role === 'USER')) {
      setCaseStrengthError(
        'Please describe your legal issue before requesting a review.'
      );
      return;
    }

    setCaseStrengthLoading(true);
    setCaseStrengthError('');
    setCaseStrengthReport('');

    try {
      const result =
        (await apiClient.getCaseStrength(
          sessionToken
        )) as CaseStrengthResponse;

      if (!result || typeof result.analysis !== 'string') {
        throw new Error(
          'The server returned an unexpected case-review response.'
        );
      }

      setCaseStrengthReport(
        [
          result.analysis,
          result.recommendation
            ? `Suggested next steps:\n${result.recommendation}`
            : '',
          result.disclaimer || '',
        ]
          .filter(Boolean)
          .join('\n\n')
      );
    } catch (err: unknown) {
      console.error('Case-strength request failed:', err);
      setCaseStrengthError(getApiErrorMessage(err));
    } finally {
      setCaseStrengthLoading(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">
              {requestedSession
                ? 'Loading your previous conversation...'
                : 'Starting your assessment...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false} maxWidth="full">
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pt-2">
        <Link
          to="/chat-history"
          className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Chat history
        </Link>
      </div>

      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <AssessmentProgress
          detectedDomain={detectedDomain}
          urgencyLevel={urgencyLevel}
          messageCount={messages.length}
        />

        {hasSafetyConcern && (
          <div className="border-b border-red-200 bg-red-50 py-4">
            <div className="mx-auto max-w-4xl px-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />

                <div>
                  <h3 className="mb-1 font-semibold text-red-900">
                    Immediate Safety Concern Detected
                  </h3>

                  <p className="mb-3 text-sm text-red-800">
                    If you are in immediate danger, contact emergency
                    services right away.
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <a href="tel:112" className="btn btn-danger btn-sm">
                      Emergency: 112
                    </a>
                    <a href="tel:100" className="btn btn-danger btn-sm">
                      Police: 100
                    </a>
                    <a href="tel:1091" className="btn btn-danger btn-sm">
                      Women Helpline: 1091
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className="relative flex-1 overflow-y-auto py-6"
          style={{
            background:
              'linear-gradient(135deg, #78350f 0%, #92400e 50%, #78350f 100%)',
            backgroundSize: '400% 400%',
            animation: 'courtGradient 15s ease infinite',
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Scale className="h-96 w-96 text-amber-200" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-4">
            <div
              className="mb-8 flex items-start gap-3 rounded-lg border-2 border-amber-500 bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 p-5 shadow-lg"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(180, 83, 9, 0.03) 10px, rgba(180, 83, 9, 0.03) 20px)',
              }}
            >
              <Scale className="mt-0.5 h-6 w-6 shrink-0 text-amber-900" />

              <div className="text-sm text-gray-900">
                <strong className="mb-1 block font-bold text-amber-900">
                  Legal Assistance Notice
                </strong>

                <span className="text-gray-800">
                  Share only information relevant to your legal issue.
                  This tool provides preliminary information, not legal
                  representation or a substitute for advice from a qualified
                  lawyer. Extracting text from a document does not establish
                  whether evidence is genuine or sufficient.
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="mb-4 flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />

                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold text-red-900">
                      Connection Error
                    </h3>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      clearSession();
                      initializedSessionRef.current = null;
                      navigate('/assessment');
                    }}
                    variant="primary"
                  >
                    Start New Assessment
                  </Button>

                  <Button onClick={clearError} variant="secondary">
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {uploadedDocuments.map(({ id, result }) => (
              <div
                key={id}
                className="mb-5 rounded-xl border border-amber-200 bg-white p-5 shadow-lg"
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <FileText className="h-6 w-6 text-amber-800" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-semibold text-gray-900">
                      {result.filename}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {(result.size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {result.review_status === 'ai_review_completed' ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <ScanText className="h-5 w-5 shrink-0 text-amber-700" />
                  )}
                </div>

                <p className="mb-3 whitespace-pre-wrap text-sm text-gray-700">
                  {result.message}
                </p>

                {result.extracted_text && (
                  <details className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer font-medium text-slate-800">
                      View extracted text
                    </summary>

                    <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words font-sans text-sm text-slate-700">
                      {result.extracted_text}
                    </pre>
                  </details>
                )}

                {result.next_steps?.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Suggested next steps
                    </h4>

                    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {result.next_steps.map((step, index) => (
                        <li key={`${id}-step-${index}`}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                  Preliminary review only. This does not verify the document
                  or predict the outcome of a legal case.
                </p>
              </div>
            ))}

            {uploadingDocument && (
              <div className="mb-5 flex items-center gap-3 rounded-lg bg-white p-4 text-sm text-gray-700 shadow">
                <LoadingSpinner size="sm" />
                Reviewing your document...
              </div>
            )}

            {isSending && <TypingIndicator />}

            {messages.length > 4 && !isSending && detectedDomain && (
              <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-center">
                <h3 className="mb-2 font-semibold text-slate-900">
                  Ready to see your assessment results?
                </h3>

                <p className="mb-4 text-sm text-slate-600">
                  Continue describing your issue or view the preliminary
                  assessment based on your conversation.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button onClick={handleViewResults} variant="primary">
                    View Results
                  </Button>

                  <Button variant="secondary" disabled>
                    Continue Conversation
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          onSend={handleSendMessage}
          onUpload={handleUploadDocument}
          disabled={isSending || hasSafetyConcern || uploadingDocument}
          placeholder={
            hasSafetyConcern
              ? 'Please contact emergency services if you are in immediate danger'
              : 'Describe your legal issue in your own words...'
          }
        />

        {/* Bottom controls — scrollable so case-strength results don't overflow */}
        <div className="overflow-y-auto">

        {sessionToken && messages.some((message) => message.role === 'USER') && (
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="font-semibold text-indigo-950">
              Preliminary case strength
            </h3>

            <p className="mt-1 text-sm text-indigo-900">
              Review the facts and evidence you have shared. This is not
              a prediction of winning.
            </p>

            <Button
              variant="secondary"
              size="sm"
              disabled={caseStrengthLoading || isSending}
              onClick={handleReviewCaseStrength}
            >
              {caseStrengthLoading
                ? 'Reviewing evidence…'
                : 'Review my case strength'}
            </Button>

            {caseStrengthError && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
                {caseStrengthError}
              </p>
            )}

            {caseStrengthReport && (
              <div className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-6 text-slate-800">
                {caseStrengthReport}
              </div>
            )}
          </div>
        )}

        {sessionToken && messages.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              onClick={handleEndSession}
              variant="secondary"
              size="sm"
            >
              End Session
            </Button>
          </div>
        )}
        </div>{/* end scrollable bottom controls */}
      </div>
    </Layout>
  );
}
