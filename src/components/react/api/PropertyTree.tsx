'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Property {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  children?: Property[];
}

interface PropertyTreeProps {
  properties: Property[];
  depth?: number;
}

export function PropertyTree({ properties, depth = 0 }: PropertyTreeProps) {
  return (
    <div className={cn('property-tree', depth > 0 && 'property-children')}>
      {properties.map((prop) => (
        <PropertyNode key={prop.name} property={prop} depth={depth} />
      ))}
    </div>
  );
}

interface PropertyNodeProps {
  property: Property;
  depth: number;
}

function PropertyNode({ property, depth }: PropertyNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = property.children && property.children.length > 0;

  // Stainless-style inline format: "name: optional type" or "name: type"
  const isOptional = !property.required;

  return (
    <div className="property-node">
      <div
        className={cn('property-node-header', hasChildren && 'cursor-pointer')}
        onClick={() => hasChildren && setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (hasChildren && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
      >
        {hasChildren && (
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform shrink-0',
              expanded && 'rotate-90',
            )}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="property-name">{property.name}</span>
            <span className="text-muted-foreground">:</span>
            {isOptional && <span className="property-optional">optional</span>}
            <span className="property-type">{property.type}</span>
          </div>
          {property.description && (
            <p className="property-description">{property.description}</p>
          )}
        </div>
      </div>
      {hasChildren && expanded && property.children && (
        <PropertyTree properties={property.children} depth={depth + 1} />
      )}
    </div>
  );
}
