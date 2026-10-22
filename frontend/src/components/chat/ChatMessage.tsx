
import type { ReactNode } from 'react';
import type { Message } from '../../types';
import { Scale, User2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function FormattedContent({ content }: { content: string }) {
  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n');

  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let numbered: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="mb-3 last:mb-0">
          {formatInline(paragraph.join(' '))}
        </p>,
      );
      paragraph = [];
    }
  };

  const flushBullets = () => {
    if (bullets.length) {
      flushParagraph();
      blocks.push(
        <ul
          key={`ul-${blocks.length}`}
          className="mb-3 list-disc space-y-1 pl-6 last:mb-0"
        >
          {bullets.map((item, index) => (
            <li key={index}>{formatInline(item)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  const flushNumbered = () => {
    if (numbered.length) {
      flushParagraph();
      blocks.push(
        <ol
          key={`ol-${blocks.length}`}
          className="mb-3 list-decimal space-y-1 pl-6 last:mb-0"
        >
          {numbered.map((item, index) => (
            <li key={index}>{formatInline(item)}</li>
          ))}
        </ol>,
      );
      numbered = [];
    }
  };

  const flushLists = () => {
    flushBullets();
    flushNumbered();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      flushParagraph();
      return;
    }

    const heading = line.match(/^#{1,4}\s+(.+)$/);

    if (heading) {
      flushLists();
      flushParagraph();

      blocks.push(
        <h3
          key={`h-${blocks.length}`}
          className="mb-2 mt-4 text-base font-bold text-amber-950 first:mt-0"
        >
          {formatInline(heading[1].replace(/\*\*/g, ''))}
        </h3>,
      );
      return;
    }

    const bullet = line.match(/^(?:[-*•])\s+(.+)$/);

    if (bullet) {
      flushNumbered();
      flushParagraph();
      bullets.push(bullet[1]);
      return;
    }

    const number = line.match(/^\d+[.)]\s+(.+)$/);

    if (number) {
      flushBullets();
      flushParagraph();
      numbered.push(number[1]);
      return;
    }

    flushLists();
    paragraph.push(line);
  });

  flushLists();
  flushParagraph();

  return (
    <div className="break-words text-sm leading-7 text-gray-900 sm:text-base">
      {blocks}
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'USER';
  const isSystem = message.role === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="my-4 flex justify-center">
        <div className="max-w-2xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <Scale className="mr-2 inline h-4 w-4" />
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-6 flex items-start gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div className="flex shrink-0 flex-col items-center gap-1">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isUser
              ? 'bg-slate-800 text-white'
              : 'bg-amber-800 text-amber-50'
          }`}
        >
          {isUser ? (
            <User2 className="h-5 w-5" />
          ) : (
            <Scale className="h-5 w-5" />
          )}
        </div>
        <span className="text-xs text-slate-600">
          {isUser ? 'You' : 'NyayaSetu'}
        </span>
      </div>

      <div
        className={`min-w-0 max-w-[90%] flex-1 sm:max-w-[80%] ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block max-w-full rounded-xl border px-4 py-3 text-left shadow-sm sm:px-5 ${
            isUser
              ? 'border-slate-300 bg-white'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-900">
              {message.content}
            </div>
          ) : (
            <FormattedContent content={message.content} />
          )}
        </div>

        <div className="mt-1 px-1 text-xs text-slate-500">
          {new Date(message.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
