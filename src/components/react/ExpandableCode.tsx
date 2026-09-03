import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

interface ExpandableCodeProps {
  /** Name shown on the toggle, e.g. a file name. */
  label?: string;
  /** Height of the collapsed preview, in pixels. */
  collapsedHeight?: number;
  children: ReactNode;
}

/**
 * Wraps a long code block (or anything else) in a collapsed preview with an
 * Expand / Collapse toggle. Content shorter than `collapsedHeight` renders
 * as-is with no toggle. Use with `client:load` in MDX.
 */
export function ExpandableCode({
  label,
  collapsedHeight = 320,
  children,
}: ExpandableCodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > collapsedHeight + 48);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  const collapsed = overflows && !expanded;
  const name = label ? ` ${label}` : '';

  return (
    <div className="sprite-expandable not-content" data-collapsed={collapsed}>
      <div
        id={id}
        ref={contentRef}
        className="sprite-expandable__content"
        style={collapsed ? { maxHeight: collapsedHeight } : undefined}
      >
        {children}
      </div>
      {overflows ? (
        <button
          type="button"
          className="sprite-expandable__toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              <ChevronUp aria-hidden="true" />
              Collapse{name}
            </>
          ) : (
            <>
              <ChevronDown aria-hidden="true" />
              Expand{name}
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
