import { CodeSnippet } from './CodeSnippet';
import { cn } from '@/lib/utils';

interface ResponseExampleProps {
  code: string;
  description?: string;
  className?: string;
}

export function ResponseExample({
  code,
  description,
  className,
}: ResponseExampleProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
          Response
        </h4>
        {description && (
          <span className="text-xs text-muted-foreground">— {description}</span>
        )}
      </div>
      <CodeSnippet code={code} language="json" collapsible maxLines={20} />
    </div>
  );
}
