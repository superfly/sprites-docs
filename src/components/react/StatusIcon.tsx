import type { ReactNode } from 'react';

interface StatusIconProps {
  type: 'check' | 'x';
  children?: ReactNode;
}

const iconStyle = {
  display: 'inline',
  verticalAlign: '-0.2em',
  marginRight: '0.35em',
} as const;

const ICONS = {
  check: {
    stroke: '#22c55e',
    paths: <path d="M20 6 9 17l-5-5" />,
  },
  x: {
    stroke: '#ef4444',
    paths: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
  },
} as const;

export function StatusIcon({ type, children }: StatusIconProps): ReactNode {
  const icon = ICONS[type];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        marginBottom: '0.5rem',
        color: 'var(--sl-color-white)',
      }}
    >
      <span style={{ flexShrink: 0 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={icon.stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconStyle}
        >
          {icon.paths}
        </svg>
      </span>
      <span>{children}</span>
    </div>
  );
}
