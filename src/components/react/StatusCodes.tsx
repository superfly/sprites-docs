import { cn } from '../../lib/utils';

interface StatusCode {
  code: number;
  label: string;
  description?: string;
}

interface StatusCodesProps {
  codes: StatusCode[];
  columns?: 2 | 3 | 4;
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (code >= 300 && code < 400) {
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }
  if (code >= 400 && code < 500) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  if (code >= 500) {
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
  return 'bg-[var(--sl-color-bg-sidebar)] text-[var(--sl-color-gray-2)] border-[var(--sl-color-hairline)]';
}

export function StatusCodes({ codes, columns = 2 }: StatusCodesProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className="my-6">
      <div className={cn('grid gap-2', gridCols[columns])}>
        {codes.map(({ code, label, description }) => (
          <div
            key={code}
            className={cn(
              'flex items-center gap-3 px-3 py-2 border transition-colors hover:bg-[var(--sl-color-bg-sidebar)]',
              getStatusColor(code),
            )}
            title={description}
          >
            <span className="font-mono text-sm font-bold">{code}</span>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Individual status badge for inline use
interface StatusBadgeProps {
  code: number;
  label?: string;
}

export function StatusBadge({ code, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border',
        getStatusColor(code),
      )}
    >
      <span className="font-mono font-bold">{code}</span>
      {label && <span>{label}</span>}
    </span>
  );
}
