'use client';

import React, { useState } from 'react';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { DEMO_USERS } from '@/lib/data/mock-db';
import { Send, MessageSquare } from 'lucide-react';
import { MARKDOWN_LIMITS, cleanMarkdownText } from '@/lib/markdown/sanitize';

interface OrderMessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface OrderChatProps {
  messages: OrderMessageItem[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export function OrderChat({ messages, onSendMessage, currentUserId }: OrderChatProps) {
  const [input, setInput] = useState('');
  const maxLength = MARKDOWN_LIMITS.MESSAGE; // 1,000 chars

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanMarkdownText(input.trim());
    if (!cleaned) return;

    onSendMessage(cleaned);
    setInput('');
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-elevate)]/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
          <span>In-Order Deal Thread ({messages.length})</span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          Markdown enabled · Secure trade chat
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((msg) => {
            const sender = DEMO_USERS.find((u) => u.id === msg.senderId) || {
              minecraftIgn: 'Player',
              role: 'USER',
              avatarUrl: 'https://picsum.photos/seed/default/100/100',
            };
            const isMe = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                  isMe
                    ? 'border-[var(--accent)]/40 bg-[var(--surface-elevate)] ml-4 sm:ml-12'
                    : 'border-[var(--border)] bg-[#090C10] mr-4 sm:mr-12'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {sender.minecraftIgn}
                    </span>
                    {sender.role !== 'USER' && (
                      <span className="text-[10px] font-mono text-[var(--accent)]">
                        [{sender.role}]
                      </span>
                    )}
                    {isMe && <span className="text-[10px] text-[var(--text-muted)]">(You)</span>}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="pt-0.5">
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">
            No messages sent yet. Use this thread to coordinate coordinates and meeting times at spawn.
          </div>
        )}
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)] bg-[var(--surface-elevate)]/30 space-y-2">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
            placeholder="Type a message in Markdown (e.g. coordinates, ETA, shulker location)..."
            rows={2}
            className="flex-1 p-2.5 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded text-xs text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 font-semibold text-xs rounded transition-colors flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span>Coordinate drop-offs at /spawn</span>
          <span>{input.length} / {maxLength} chars</span>
        </div>
      </form>
    </div>
  );
}
