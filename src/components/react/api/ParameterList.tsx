import { PropertyRow, type PropertyRowProps } from './PropertyRow';
import { cn } from '@/lib/utils';

export interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string;
}

interface ParameterListProps {
  title: string;
  parameters: Parameter[];
  className?: string;
}

export function ParameterList({
  title,
  parameters,
  className,
}: ParameterListProps) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
        {title}
      </h4>
      <div className="rounded-lg border border-border/50 divide-y divide-border/50">
        {parameters.map((param) => (
          <PropertyRow key={param.name} {...param} />
        ))}
      </div>
    </div>
  );
}
