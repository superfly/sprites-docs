import type { ReactNode } from 'react';

interface StatusIconProps {
  type: 'check' | 'x';
  children?: ReactNode;
}

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: '-0.2em', marginRight: '0.35em' }}><path d="M20 6 9 17l-5-5"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: '-0.2em', marginRight: '0.35em' }}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export function StatusIcon({ type, children }: StatusIconProps) {
  const Icon = type === 'check' ? CheckIcon : XIcon;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      marginBottom: '0.5rem',
      color: 'var(--sl-color-white)'
    }}>
      <span style={{ flexShrink: 0 }}><Icon /></span>
      <span>{children}</span>
    </div>
  );
}
