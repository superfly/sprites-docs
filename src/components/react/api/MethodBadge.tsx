import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WS';

// Colors match Stainless API docs reference
const methodStyles: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
  POST: 'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25',
  PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25',
  PATCH: 'bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25',
  WS: 'bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25',
};

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono font-semibold text-xs uppercase tracking-wide',
        methodStyles[method],
        className,
      )}
    >
      {method}
    </Badge>
  );
}
