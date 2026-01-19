import type { LucideIcon } from 'lucide-react';
import { AlertCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type CalloutType = 'info' | 'warning' | 'danger' | 'tip';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

interface CalloutConfig {
  icon: LucideIcon;
  borderStyle: string;
  titleStyle: string;
}

const CALLOUT_CONFIG: Record<CalloutType, CalloutConfig> = {
  info: {
    icon: Info,
    borderStyle: 'border-green-500/50 [&>svg]:text-green-500',
    titleStyle: 'text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    borderStyle: 'border-amber-500/50 [&>svg]:text-amber-500',
    titleStyle: 'text-amber-500',
  },
  danger: {
    icon: AlertCircle,
    borderStyle: 'border-red-500/50 [&>svg]:text-red-500',
    titleStyle: 'text-red-500',
  },
  tip: {
    icon: Lightbulb,
    borderStyle: 'border-blue-500/50 [&>svg]:text-blue-500',
    titleStyle: 'text-blue-500',
  },
};

export function Callout({
  type = 'info',
  title,
  children,
}: CalloutProps): ReactNode {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;

  return (
    <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
      <Alert className={cn(config.borderStyle)}>
        <Icon />
        {title && (
          <AlertTitle className={config.titleStyle}>{title}</AlertTitle>
        )}
        <AlertDescription className="[&>p]:m-0 justify-items-stretch">
          {children}
        </AlertDescription>
      </Alert>
    </div>
  );
}
