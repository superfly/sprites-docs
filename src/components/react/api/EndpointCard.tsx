'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EndpointHeader } from './EndpointHeader';
import { type Parameter, ParameterList } from './ParameterList';
import { ResponseExample } from './ResponseExample';
import { type CodeExample, SnippetTabs } from './SnippetTabs';

interface EndpointCardProps {
  method: string;
  path: string;
  description?: string;
  isWebSocket?: boolean;
  pathParams?: Parameter[];
  queryParams?: Parameter[];
  bodyParams?: Parameter[];
  examples?: CodeExample[];
  response?: {
    code: string;
    description?: string;
  };
  className?: string;
}

export function EndpointCard({
  method,
  path,
  description,
  isWebSocket,
  pathParams,
  queryParams,
  bodyParams,
  examples,
  response,
  className,
}: EndpointCardProps) {
  return (
    <Card
      className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}
    >
      <CardHeader className="pb-4">
        <EndpointHeader
          method={method}
          path={path}
          description={description}
          isWebSocket={isWebSocket}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {pathParams && pathParams.length > 0 && (
          <ParameterList title="Path Parameters" parameters={pathParams} />
        )}
        {queryParams && queryParams.length > 0 && (
          <ParameterList title="Query Parameters" parameters={queryParams} />
        )}
        {bodyParams && bodyParams.length > 0 && (
          <ParameterList title="Request Body" parameters={bodyParams} />
        )}

        {examples && examples.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              Examples
            </h4>
            <SnippetTabs examples={examples} />
          </div>
        )}

        {response && (
          <ResponseExample
            code={response.code}
            description={response.description}
          />
        )}
      </CardContent>
    </Card>
  );
}
