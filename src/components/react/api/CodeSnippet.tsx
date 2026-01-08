'use client';

import { useState } from 'react';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeSnippetProps {
  code: string;
  language: string;
  title?: string;
  collapsible?: boolean;
  maxLines?: number;
  className?: string;
}

export function CodeSnippet({
  code,
  language,
  title,
  collapsible = false,
  maxLines = 15,
  className,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lines = code.split('\n');
  const shouldCollapse = collapsible && lines.length > maxLines;
  const displayCode =
    shouldCollapse && !expanded
      ? lines.slice(0, maxLines).join('\n')
      : code;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-[var(--snippet-border)] bg-[var(--snippet-bg)] overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 h-10 bg-[var(--snippet-header-bg)] border-b border-[var(--snippet-border)]">
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      )}

      {/* Code block with copy button */}
      <div className="relative group">
        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'absolute top-3 right-3 z-10',
            'flex items-center justify-center size-7',
            'rounded-md bg-background/80 backdrop-blur-sm',
            'border border-border/50',
            'text-muted-foreground hover:text-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring',
            copied && 'opacity-100'
          )}
        >
          {copied ? (
            <Check className="size-3.5 text-primary" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>

        {/* Code content */}
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
          <code className={`language-${language}`}>{displayCode}</code>
        </pre>

        {/* Collapsed fade gradient */}
        {shouldCollapse && !expanded && (
          <div className="absolute bottom-10 left-0 right-0 h-16 bg-gradient-to-t from-[var(--snippet-bg)] to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/collapse button */}
      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center justify-center gap-1.5',
            'h-9 text-xs font-medium',
            'border-t border-[var(--snippet-border)]',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            'transition-colors'
          )}
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="size-3" />
            </>
          ) : (
            <>
              Show {lines.length - maxLines} more lines <ChevronDown className="size-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
