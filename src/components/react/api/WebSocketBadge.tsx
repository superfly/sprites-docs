import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebSocketBadgeProps {
  className?: string;
}

export function WebSocketBadge({ className }: WebSocketBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-purple-500/10 text-purple-400 border-purple-500/20 gap-1',
        className,
      )}
    >
      <Zap className="h-3 w-3" />
      WebSocket
    </Badge>
  );
}
