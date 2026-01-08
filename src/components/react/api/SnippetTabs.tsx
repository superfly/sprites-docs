'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeSnippet } from './CodeSnippet';
import { cn } from '@/lib/utils';

export interface CodeExample {
  language: string;
  label?: string;
  code: string;
}

interface SnippetTabsProps {
  examples: CodeExample[];
  defaultTab?: string;
  className?: string;
}

const languageLabels: Record<string, string> = {
  cli: 'CLI',
  bash: 'CLI',
  curl: 'cURL',
  go: 'Go',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  elixir: 'Elixir',
  json: 'JSON',
  shell: 'Shell',
};

export function SnippetTabs({
  examples,
  defaultTab,
  className,
}: SnippetTabsProps) {
  if (!examples || examples.length === 0) return null;

  return (
    <Tabs
      defaultValue={defaultTab || examples[0]?.language}
      className={cn('w-full', className)}
    >
      <TabsList className="h-9 bg-muted/50 border border-border/50 rounded-lg p-1">
        {examples.map((ex) => (
          <TabsTrigger
            key={ex.language}
            value={ex.language}
            className="text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {languageLabels[ex.language] || ex.label || ex.language}
          </TabsTrigger>
        ))}
      </TabsList>
      {examples.map((ex) => (
        <TabsContent key={ex.language} value={ex.language} className="mt-3">
          <CodeSnippet code={ex.code} language={ex.language} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
