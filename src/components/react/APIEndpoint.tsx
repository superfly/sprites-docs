import { Check, ChevronDown, Terminal } from 'lucide-react';
import {
  Children,
  isValidElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../lib/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const methodStyles: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface APIEndpointProps {
  method: HttpMethod;
  path: string;
  description?: string;
  children?: ReactNode;
}

interface APIBodyProps {
  title: string;
  children: ReactNode;
}

export function APIBody({ children }: APIBodyProps) {
  return <>{children}</>;
}

function formatPath(path: string) {
  // Highlight path parameters like :name
  return path.split(/(:[\w]+)/g).map((part, index) => {
    if (part.startsWith(':')) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: parts may duplicate, index ensures uniqueness
        <span key={`${part}-${index}`} className="text-violet-400">
          {part}
        </span>
      );
    }
    return part;
  });
}

function extractJsonFromChildren(node: ReactNode): string | null {
  if (!node) return null;

  // Handle string content directly
  if (typeof node === 'string') {
    const trimmed = node.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return trimmed;
    }
    return null;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    for (const child of node) {
      const result = extractJsonFromChildren(child);
      if (result) return result;
    }
    return null;
  }

  // Handle React elements
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode; className?: string };

    // Check if this is a code element with JSON content
    if (props.className?.includes('language-json') || node.type === 'code') {
      return extractJsonFromChildren(props.children);
    }

    // Recurse into children
    return extractJsonFromChildren(props.children);
  }

  return null;
}

export function APIEndpoint({
  method,
  path,
  description,
  children,
}: APIEndpointProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Extract APIBody components from children
  const bodies: { title: string; content: ReactNode }[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<APIBodyProps>(child) && child.props?.title) {
      bodies.push({
        title: child.props.title,
        content: child.props.children,
      });
    }
  });

  // Extract request body JSON for cURL generation
  const requestBody = useMemo(() => {
    const requestSection = bodies.find((b) =>
      b.title.toLowerCase().includes('request'),
    );
    if (!requestSection) return null;
    return extractJsonFromChildren(requestSection.content);
  }, []);

  const generateCurl = () => {
    const baseUrl = 'https://api.sprites.dev';
    const lines = [];

    if (method === 'GET') {
      lines.push('curl');
    } else {
      lines.push(`curl -X ${method}`);
    }

    lines.push('  -H "Authorization: Bearer $SPRITE_TOKEN"');

    if (requestBody) {
      lines.push('  -H "Content-Type: application/json"');
      // Format JSON compactly for cURL
      try {
        const parsed = JSON.parse(requestBody);
        lines.push(`  -d '${JSON.stringify(parsed)}'`);
      } catch {
        lines.push(
          `  -d '${requestBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'`,
        );
      }
    }

    lines.push(`  ${baseUrl}${path}`);

    return lines.join(' \\\n');
  };

  const handleCopy = async () => {
    const curl = generateCurl();
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 overflow-hidden border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-nav)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)] px-4 py-3">
        <span
          className={cn(
            'shrink-0 px-2 py-1 text-xs font-bold uppercase tracking-wide border',
            methodStyles[method],
          )}
        >
          {method}
        </span>
        <code className="flex-1 font-mono text-sm text-[var(--sl-color-white)]">
          {formatPath(path)}
        </code>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--sl-color-gray-2)] hover:text-[var(--sl-color-white)] hover:bg-[var(--sl-color-bg)] transition-colors"
            title="Copy as cURL"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Terminal className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">cURL</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[var(--sl-color-gray-2)] hover:text-[var(--sl-color-white)] transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="px-4 py-2 text-sm text-[var(--sl-color-gray-2)] border-b border-[var(--sl-color-hairline)]">
          {description}
        </div>
      )}

      {/* Collapsible Content */}
      <div
        className={cn(
          'grid transition-all duration-200',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          {bodies.length > 0 && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)]">
                {bodies.map((body, index) => (
                  <button
                    type="button"
                    key={body.title}
                    onClick={() => setActiveTab(index)}
                    className={cn(
                      'px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                      activeTab === index
                        ? 'border-[var(--sl-color-accent)] text-[var(--sl-color-white)] bg-[var(--sl-color-bg)]'
                        : 'border-transparent text-[var(--sl-color-gray-2)] hover:text-[var(--sl-color-white)] hover:bg-[var(--sl-color-bg)]/50',
                    )}
                  >
                    {body.title}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="[&_pre]:my-0 [&_pre]:rounded-none [&_pre]:border-0 [&_.param-table-wrapper]:border-0 [&_.param-table-wrapper]:my-0 text-sm api-body-content">
                <div className="p-4 [&:has(pre)]:p-0 [&:has(.param-table-wrapper)]:p-0 [&>p]:m-0 [&_p]:m-0">
                  {bodies[activeTab]?.content}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
