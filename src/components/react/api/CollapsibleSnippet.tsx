'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSnippetProps {
  code: string;
  language: string;
  title?: string;
  collapsedLines?: number;
}

export function CollapsibleSnippet({
  code,
  language,
  title,
  collapsedLines = 8,
}: CollapsibleSnippetProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');
  const shouldCollapse = lines.length > collapsedLines;
  const displayCode = expanded ? code : lines.slice(0, collapsedLines).join('\n');
  const hiddenCount = lines.length - collapsedLines;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="snippet-container">
      {title && (
        <div className="snippet-title">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            className="h-7 w-7"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className={`language-${language}`}>{displayCode}</code>
        </pre>
        {shouldCollapse && !expanded && <div className="snippet-fade" />}
      </div>
      {shouldCollapse && (
        <div className="flex justify-center pb-3 -mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-7 text-xs bg-background/80 backdrop-blur-sm"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                Show {hiddenCount} more lines <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
