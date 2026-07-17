import { useState } from 'react';
import { cn } from '@/lib/utils';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'WS'
  | 'WSS';

interface MethodHeaderProps {
  method: HttpMethod;
  path: string;
  title: string;
  description?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Method icons matching Stainless API docs style
function MethodIcon({ method }: { method: HttpMethod }) {
  const iconProps = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (method) {
    case 'GET':
      // Arrow down-left (receive/fetch data)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
          <path d="M17 7 7 17" />
          <path d="M17 17H7V7" />
        </svg>
      );
    case 'POST':
      // Arrow up-right (send/create data)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      );
    case 'PUT':
    case 'PATCH':
      // Arrow up-right (send/update data) - same as POST
      return (
        <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      );
    case 'DELETE':
      // X mark
      return (
        <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case 'WS':
    case 'WSS':
      // Lightning bolt
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          {...iconProps}
          fill="currentColor"
          stroke="none"
        >
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    default:
      return null;
  }
}

// Self-contained heading anchor: copies the section URL and plays the
// link→check animation entirely in React. Because MethodHeader is a hydrated
// island, letting the global Head.astro script mutate this DOM before
// hydration causes a mismatch that wipes the injected icon/handler — so we own
// it here instead. The global script skips anchors inside `.method-header`.
function AnchorLink({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const { href } = e.currentTarget;
    navigator.clipboard
      ?.writeText(href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
    history.pushState(null, '', `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <a
      className={cn('sl-anchor-link', copied && 'copied')}
      href={`#${id}`}
      aria-label={`Link to ${title}`}
      onClick={handleClick}
    >
      <span aria-hidden="true" className="sl-anchor-icon">
        <span className="link-icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
            <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
        </span>
        <span className="check-icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-icon"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
      </span>
      <span className="sr-only">Section titled "{title}"</span>
    </a>
  );
}

export function MethodHeader({
  method,
  path,
  title,
  description,
}: MethodHeaderProps) {
  const methodLower = method.toLowerCase();
  const id = slugify(title);

  return (
    <div className="method-header">
      {/* Title with anchor link like Starlight headings */}
      <div className="sl-heading-wrapper level-h2">
        <h2 id={id} className="method-title">
          {title}
        </h2>
        <AnchorLink id={id} title={title} />
      </div>
      <div className="method-header-badges">
        <span className={cn('method-badge', `method-badge-${methodLower}`)}>
          <span className="method-badge-icon">
            <MethodIcon method={method} />
          </span>
          {method}
        </span>
        <code className="method-path">{path}</code>
      </div>
      {description && <p className="method-description">{description}</p>}
    </div>
  );
}
