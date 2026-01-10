import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PropertyRowProps {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string;
  className?: string;
}

export function PropertyRow({
  name,
  type,
  required,
  description,
  default: defaultValue,
  className,
}: PropertyRowProps) {
  return (
    <div className={cn('px-4 py-3 flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="font-mono font-medium text-sm text-foreground">
          {name}
        </code>
        <span className="text-muted-foreground text-xs font-mono">{type}</span>
        {required && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20"
          >
            required
          </Badge>
        )}
        {!required && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border"
          >
            optional
          </Badge>
        )}
        {defaultValue && (
          <span className="text-xs text-muted-foreground">
            Default: <code className="font-mono">{defaultValue}</code>
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
