import { Children, isValidElement, type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CodeTabsProps {
  children: ReactNode
}

interface SnippetProps {
  name: string
  children: ReactNode
}

export function CodeTabs({ children }: CodeTabsProps) {
  // Extract snippets from children
  const snippets: { name: string; content: ReactNode }[] = []

  Children.forEach(children, (child) => {
    if (isValidElement<SnippetProps>(child) && child.props?.name) {
      snippets.push({
        name: child.props.name,
        content: child.props.children,
      })
    }
  })

  if (snippets.length === 0) {
    return <div>{children}</div>
  }

  return (
    <div className="not-prose my-6 overflow-hidden border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-nav)]">
      <Tabs defaultValue={snippets[0].name} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)] p-0 h-auto">
          {snippets.map((snippet) => (
            <TabsTrigger
              key={snippet.name}
              value={snippet.name}
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium data-[state=active]:border-[var(--sl-color-accent)] data-[state=active]:bg-[var(--sl-color-bg)] data-[state=active]:shadow-none"
            >
              {formatTabName(snippet.name)}
            </TabsTrigger>
          ))}
        </TabsList>
        {snippets.map((snippet) => (
          <TabsContent
            key={snippet.name}
            value={snippet.name}
            className="mt-0 [&_pre]:my-0 [&_pre]:rounded-none [&_pre]:border-0"
          >
            {snippet.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export function Snippet({ children }: SnippetProps) {
  return <>{children}</>
}

function formatTabName(name: string): string {
  const names: Record<string, string> = {
    cli: 'CLI',
    javascript: 'JavaScript',
    go: 'Go',
    macos: 'macOS',
    linux: 'Linux',
    windows: 'Windows',
    bash: 'Bash',
    typescript: 'TypeScript',
    python: 'Python',
  }
  return names[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1)
}
