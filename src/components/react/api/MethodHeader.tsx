import { cn } from '@/lib/utils';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WS' | 'WSS';

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
        <svg xmlns="http://www.w3.org/2000/svg" {...iconProps} fill="currentColor" stroke="none">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    default:
      return null;
  }
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
        <a className="sl-anchor-link" href={`#${id}`} aria-label={`Link to ${title}`}>
          <span className="sl-anchor-icon">
            <span className="link-icon-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </span>
          </span>
        </a>
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
