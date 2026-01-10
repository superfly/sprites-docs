import { cn } from '@/lib/utils';
import { type HttpMethod, MethodBadge } from './MethodBadge';
import { WebSocketBadge } from './WebSocketBadge';

interface EndpointHeaderProps {
  method: string;
  path: string;
  isWebSocket?: boolean;
  description?: string;
  className?: string;
}

export function EndpointHeader({
  method,
  path,
  isWebSocket,
  description,
  className,
}: EndpointHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-3 flex-wrap">
        <MethodBadge method={method.toUpperCase() as HttpMethod} />
        <code className="font-mono text-base text-foreground/90">{path}</code>
        {isWebSocket && <WebSocketBadge />}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
