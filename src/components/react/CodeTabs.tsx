import { Children, isValidElement, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLanguageLabel } from '@/lib/language-config';

interface CodeTabsProps {
  children: ReactNode;
}

interface SnippetProps {
  name: string;
  children: ReactNode;
}

export function CodeTabs({ children }: CodeTabsProps) {
  // Extract snippets from children
  const snippets: { name: string; content: ReactNode }[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement<SnippetProps>(child) && child.props?.name) {
      snippets.push({
        name: child.props.name,
        content: child.props.children,
      });
    }
  });

  if (snippets.length === 0) {
    return <div>{children}</div>;
  }

  return (
    <div className="not-prose my-6">
      <Tabs defaultValue={snippets[0].name} className="w-full">
        <TabsList className="mb-2">
          {snippets.map((snippet) => (
            <TabsTrigger key={snippet.name} value={snippet.name}>
              {getLanguageLabel(snippet.name)}
            </TabsTrigger>
          ))}
        </TabsList>
        {snippets.map((snippet) => (
          <TabsContent key={snippet.name} value={snippet.name} className="mt-0">
            {snippet.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function Snippet({ children }: SnippetProps) {
  return <>{children}</>;
}
