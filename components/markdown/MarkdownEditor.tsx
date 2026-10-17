'use client';

import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Eye,
  PenLine,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { cleanMarkdownText } from '@/lib/markdown/sanitize';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  maxLength,
  placeholder = 'Write in Markdown...',
  minHeight = '180px',
  label,
  error,
  disabled = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = value.length;
  const isNearLimit = characterCount >= maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  // Formatting helpers for toolbar buttons
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextValue = value.substring(0, start) + replacement + value.substring(end);

    if (nextValue.length <= maxLength) {
      onChange(nextValue);
      // Re-focus and set selection
      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + prefix.length + selectedText.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const insertLinePrefix = (prefix: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const lines = selectedText.split('\n');
    const formatted = lines.map((line) => `${prefix} ${line}`).join('\n');
    const nextValue = value.substring(0, start) + formatted + value.substring(end);

    if (nextValue.length <= maxLength) {
      onChange(nextValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formatted.length, start + formatted.length);
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cleaned = cleanMarkdownText(e.target.value);
    if (cleaned.length <= maxLength) {
      onChange(cleaned);
    } else {
      onChange(cleaned.slice(0, maxLength));
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {/* Top Header Bar with Label & Tab Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 bg-[var(--surface-elevate)] p-0.5 rounded border border-[var(--border)] ml-auto">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              tab === 'write'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              tab === 'preview'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div
        className={`border rounded-md bg-[var(--surface)] overflow-hidden transition-colors ${
          error ? 'border-[#F85149]' : 'border-[var(--border)] focus-within:border-[var(--accent)]'
        }`}
      >
        {/* Write Toolbar (shown only in Write tab) */}
        {tab === 'write' && (
          <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-[var(--border)] bg-[var(--surface-elevate)]/60 text-[var(--text-muted)]">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold')}
              title="Bold (**text**)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic')}
              title="Italic (*text*)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
              title="Strikethrough (~~text~~)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-3.5 bg-[var(--border)] mx-1" aria-hidden="true" />

            <button
              type="button"
              onClick={() => insertLinePrefix('##')}
              title="Heading 2 (## Section)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('###')}
              title="Heading 3 (### Sub-section)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-3.5 bg-[var(--border)] mx-1" aria-hidden="true" />

            <button
              type="button"
              onClick={() => insertLinePrefix('-')}
              title="Bullet list (- Item)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('1.')}
              title="Numbered list (1. Item)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('>')}
              title="Blockquote (> Quote)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-3.5 bg-[var(--border)] mx-1" aria-hidden="true" />

            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'code')}
              title="Inline code (`code`)"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://example.com)', 'link')}
              title="Link ([Title](url))"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertFormatting(
                  '\n| Item | Qty | Price |\n| :--- | :-- | :---- |\n| Spawner | 1 | 250k $ |\n'
                )
              }
              title="Insert Table"
              className="p-1.5 rounded hover:bg-[var(--surface-elevate)] hover:text-[var(--text-primary)] transition-colors"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor Body */}
        {tab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            style={{ minHeight }}
            className="w-full p-3.5 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-y leading-relaxed font-sans"
          />
        ) : (
          <div style={{ minHeight }} className="p-3.5 bg-[var(--surface)] overflow-y-auto">
            <MarkdownRenderer content={value} maxLength={maxLength} />
          </div>
        )}

        {/* Footer Bar: Counter and Limits */}
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-[var(--border)] bg-[var(--surface-elevate)]/30 text-[11px]">
          <span className="text-[var(--text-muted)]">
            Markdown enabled · No remote images · No raw HTML
          </span>
          <span
            className={`font-mono font-medium ${
              isOverLimit
                ? 'text-[#F85149]'
                : isNearLimit
                ? 'text-[#DB6D28]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {characterCount.toLocaleString()} / {maxLength.toLocaleString()} chars
          </span>
        </div>
      </div>

      {error && <p className="text-xs text-[#F85149] font-medium mt-1">{error}</p>}
    </div>
  );
}
