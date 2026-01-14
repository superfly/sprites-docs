import { AlertCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'tip';
  title?: string;
  children: ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  tip: Lightbulb,
};

const styles = {
  info: 'border-green-500/50 [&>svg]:text-green-500',
  warning: 'border-amber-500/50 [&>svg]:text-amber-500',
  danger: 'border-red-500/50 [&>svg]:text-red-500',
  tip: 'border-blue-500/50 [&>svg]:text-blue-500',
};

const titleStyles = {
  info: 'text-green-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
  tip: 'text-blue-500',
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
      <Alert className={cn(styles[type])}>
        <Icon />
        {title && (
          <AlertTitle className={titleStyles[type]}>{title}</AlertTitle>
        )}
        <AlertDescription className="[&>p]:m-0 justify-items-stretch">
          {children}
        </AlertDescription>
      </Alert>
    </div>
  );
}
