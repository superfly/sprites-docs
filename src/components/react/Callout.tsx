import type { ReactNode } from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'tip';
  title?: string;
  children: ReactNode;
}

// fly.io/docs' exact callout glyphs (filled, tinted via currentColor).
const icons: Record<NonNullable<CalloutProps['type']>, ReactNode> = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="10" r="9.5" fillOpacity="0.25" />
      <path d="M10.001 8.866H10c-.619 0-1.12.5-1.12 1.115v3.79c.005.61.504 1.104 1.119 1.105H10c.619 0 1.12-.501 1.12-1.115V9.97a1.117 1.117 0 0 0-1.119-1.104zM10 7.544A1.34 1.34 0 0 1 8.657 6.21 1.34 1.34 0 0 1 10 4.876a1.34 1.34 0 0 1 1.343 1.334A1.34 1.34 0 0 1 10 7.544z" />
    </svg>
  ),
  tip: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillOpacity="0.3"
        d="M10 2.5a5 5 0 0 0-3 9.02v1.23c0 .41.34.75.75.75h4.5c.41 0 .75-.34.75-.75v-1.23A5 5 0 0 0 10 2.5z"
      />
      <path d="M7.75 15.25c0 .28.22.5.5.5h3.5a.5.5 0 0 0 0-1h-3.5a.5.5 0 0 0-.5.5zm.63 1.65c.24.57.79.95 1.62.95s1.38-.38 1.62-.95H8.38z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillOpacity="0.4"
        d="M12.054 2.732a2.383 2.383 0 0 0-4.108 0l-7.12 12.14a2.364 2.364 0 0 0-.007 2.384 2.382 2.382 0 0 0 2.061 1.187h14.24c.851 0 1.637-.454 2.061-1.187a2.364 2.364 0 0 0-.007-2.384l-7.12-12.14z"
      />
      <path d="M9.999 11.881H10a1.12 1.12 0 0 0 1.121-1.116l-.001-3.79a1.119 1.119 0 0 0-1.119-1.105H10c-.619 0-1.12.501-1.12 1.116v3.79c.006.61.504 1.104 1.119 1.105zM10 13.202a1.34 1.34 0 0 1 1.343 1.334c0 .737-.602 1.334-1.343 1.334a1.339 1.339 0 0 1-1.343-1.334A1.34 1.34 0 0 1 10 13.202z" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="10" r="9.5" fillOpacity="0.25" />
      <path d="M9.999 10.886H10c.619 0 1.12-.5 1.121-1.115l-.001-3.79a1.118 1.118 0 0 0-1.119-1.105H10c-.619 0-1.12.5-1.12 1.115v3.79c.006.61.504 1.105 1.119 1.105zM10 12.208c.741 0 1.343.597 1.343 1.334A1.34 1.34 0 0 1 10 14.876a1.34 1.34 0 0 1-1.343-1.334c0-.737.602-1.334 1.343-1.334z" />
    </svg>
  ),
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <aside className="sprite-callout not-content" data-variant={type}>
      <span className="sprite-callout__icon" aria-hidden="true">
        {icons[type]}
      </span>
      <div className="sprite-callout__content">
        {title ? <p className="sprite-callout__title">{title}</p> : null}
        {children}
      </div>
    </aside>
  );
}
