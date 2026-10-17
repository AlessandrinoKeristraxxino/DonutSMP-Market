'use client';

import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cleanMarkdownText, strictSanitizeSchema } from '@/lib/markdown/sanitize';
import { ExternalLink, ImageOff } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  maxLength?: number;
}

export function MarkdownRenderer({
  content,
  className = '',
  maxLength,
}: MarkdownRendererProps) {
  const sanitizedText = cleanMarkdownText(content || '', maxLength);

  if (!sanitizedText.trim()) {
    return <span className="text-xs text-[var(--text-muted)] italic">No content provided</span>;
  }

  return (
    <div className={`markdown-content text-sm text-[var(--text-primary)] leading-relaxed ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, strictSanitizeSchema]]}
        components={{
          // Force h1 to render as h2 to keep single h1 per page
          h1: ({ children }) => (
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-[var(--text-primary)] mt-3 mb-1.5 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mt-2.5 mb-1 tracking-tight">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm text-[var(--text-primary)]/90 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[var(--text-primary)]/90">{children}</em>
          ),
          del: ({ children }) => (
            <del className="line-through text-[var(--text-muted)]">{children}</del>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 space-y-1 my-2 text-sm text-[var(--text-primary)]/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 space-y-1 my-2 text-sm text-[var(--text-primary)]/90">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          // Surface contrast blockquote avoiding clichéd thick left accent stripe
          blockquote: ({ children }) => (
            <blockquote className="my-3 px-4 py-2.5 rounded bg-[var(--surface-elevate)] border border-[var(--border)] text-xs text-[var(--text-muted)] italic">
              {children}
            </blockquote>
          ),
          // Code block and inline code
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[var(--surface-elevate)] border border-[var(--border)] text-xs font-mono text-[var(--accent)]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-3 p-3.5 rounded bg-[#090C10] border border-[var(--border)] overflow-x-auto">
                <code className="text-xs font-mono text-stone-200 block" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          // Strict link security: target="_blank" + rel="nofollow noopener noreferrer ugc"
          a: ({ href, children }) => {
            const isSafe = href && (href.startsWith('http://') || href.startsWith('https://'));
            if (!isSafe) {
              return <span className="text-[var(--text-muted)]">{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="nofollow noopener noreferrer ugc"
                className="text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium transition-colors"
              >
                <span>{children}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
              </a>
            );
          },
          // Remote images inside Markdown are explicitly banned by spec
          img: () => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 my-2 text-xs text-[var(--text-muted)] bg-[var(--surface-elevate)] rounded border border-[var(--border)]">
              <ImageOff className="w-3.5 h-3.5 opacity-60" />
              <span>Remote images disallowed in text (use upload gallery)</span>
            </span>
          ),
          // Clean responsive tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-[var(--border)] rounded">
              <table className="w-full text-xs text-left divide-y divide-[var(--border)]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--surface-elevate)] text-[var(--text-muted)] font-medium">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="py-2 px-3 font-semibold text-[var(--text-primary)]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 text-[var(--text-primary)]/90">{children}</td>
          ),
          hr: () => <hr className="my-4 border-[var(--border)]" />,
        }}
      >
        {sanitizedText}
      </Markdown>
    </div>
  );
}
