'use client';

import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PropertyRow } from './PropertyRow';

export interface TypeField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

interface TypeReferenceProps {
  name: string;
  description?: string;
  fields: TypeField[];
  className?: string;
}

export function TypeReference({
  name,
  description,
  fields,
  className,
}: TypeReferenceProps) {
  return (
    <Collapsible className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 group w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-90 transition-transform" />
        <code className="font-mono font-medium text-sm">{name}</code>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {fields.length} fields
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-6 mt-2 space-y-2">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <div className="rounded-lg border border-border/50 divide-y divide-border/50">
            {fields.map((field) => (
              <PropertyRow key={field.name} {...field} />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
