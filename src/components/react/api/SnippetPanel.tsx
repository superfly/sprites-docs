'use client';

import { useState } from 'react';
import { CollapsibleSnippet } from './CollapsibleSnippet';
import { type SDKLanguage, SDKSelector } from './SDKSelector';

export interface CodeExample {
  language: SDKLanguage;
  code: string;
  title?: string;
}

interface SnippetPanelProps {
  examples: CodeExample[];
  response?: string;
}

export function SnippetPanel({ examples, response }: SnippetPanelProps) {
  // Find first available language from examples
  const availableLanguages = examples.map((e) => e.language);
  const defaultLanguage = availableLanguages[0] || 'cli';
  const [language, setLanguage] = useState<SDKLanguage>(defaultLanguage);

  const currentExample = examples.find((e) => e.language === language);

  // Map SDK language to code language for syntax highlighting
  const getCodeLanguage = (lang: SDKLanguage): string => {
    switch (lang) {
      case 'cli':
        return 'bash';
      case 'javascript':
        return 'typescript';
      case 'go':
        return 'go';
      case 'python':
        return 'python';
      case 'elixir':
        return 'elixir';
      default:
        return 'text';
    }
  };

  return (
    <div className="snippet-panel space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
          Request
        </h4>
        <SDKSelector value={language} onChange={setLanguage} />
      </div>

      {currentExample && (
        <CollapsibleSnippet
          code={currentExample.code}
          language={getCodeLanguage(currentExample.language)}
          title={currentExample.title}
        />
      )}

      {response && (
        <>
          <h4
            className="text-sm font-semibold text-foreground/80 uppercase tracking-wide"
            style={{ paddingTop: '1rem' }}
          >
            Response
          </h4>
          <CollapsibleSnippet
            code={response}
            language="json"
            collapsedLines={12}
          />
        </>
      )}
    </div>
  );
}
