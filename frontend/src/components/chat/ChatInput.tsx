
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send, Paperclip, FileText, X } from 'lucide-react';
import Button from '../common/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onUpload?: (file: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

const ACCEPTED_FILES = '.pdf,.txt,.jpg,.jpeg,.png,.webp';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ChatInput({
  onSend,
  onUpload,
  disabled = false,
  placeholder = 'Type your message here...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();

    if (trimmed && !disabled && !isUploading) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadError('');

    const allowedExtension = /\.(pdf|txt|jpe?g|png|webp)$/i.test(file.name);

    if (!allowedExtension) {
      setUploadError('Choose a PDF, TXT, JPG, PNG, or WEBP file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('The file must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }

    if (file.size === 0) {
      setUploadError('The selected file is empty.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload || disabled || isUploading) return;

    setIsUploading(true);
    setUploadError('');

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'The file could not be uploaded. Please try again.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-100 to-yellow-50 border-t-4 border-amber-600 p-4 shadow-xl">
      <div className="max-w-4xl mx-auto">
        {onUpload && (
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILES}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
            aria-label="Choose a legal document"
          />
        )}

        {selectedFile && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-amber-300 bg-white p-3">
            <FileText className="h-6 w-6 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setUploadError('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={isUploading}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Remove selected file"
            >
              <X className="h-5 w-5" />
            </button>

            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="bg-amber-700 text-white hover:bg-amber-600"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}

        {uploadError && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {uploadError}
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          {onUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="self-end rounded-lg border-2 border-amber-500 bg-white p-3 text-amber-800 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
              title="Attach a legal document or image"
              aria-label="Attach a legal document or image"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="min-w-0 flex-1 resize-none rounded-lg border-2 border-amber-400 bg-white px-4 py-3 font-serif text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '150px' }}
          />

          <Button
            onClick={handleSend}
            disabled={disabled || isUploading || !message.trim()}
            className="self-end rounded-lg bg-amber-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-2 text-center text-xs font-medium text-amber-900">
          💡 Include relevant dates, amounts, evidence, and what happened.
          Attach a PDF, text file, or image to extract its readable text.
        </div>
      </div>
    </div>
  );
}
