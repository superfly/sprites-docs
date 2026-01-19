#!/usr/bin/env npx tsx

/**
 * API Documentation Generator
 * Fetches API schema and SDK examples, generates MDX documentation pages.
 * Uses double-pane layout (Stainless-style) with SDK selector and collapsible snippets.
 * Supports multiple API versions with versioned output directories.
 */

import { constants } from 'node:fs';
import {
  access,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';
import {
  API_VERSIONS,
  type APIVersion,
  DEFAULT_VERSION,
} from '../src/lib/api-versions';

const OUTPUT_BASE_DIR = './src/content/docs/api';

// ============================================================================
// Types
// ============================================================================

interface APISchema {
  description: string;
  version: string;
  generated: string;
  endpoints: APIEndpoint[];
  types: Record<string, APIType>;
  enums: Record<string, APIEnum>;
  websocket_messages: Record<string, WebSocketMessage>;
}

interface APIEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'WSS';
  description: string;
  protocol: 'http' | 'websocket';
  category: string;
  handler?: string;
  visibility?: string;
  middleware?: string[];
  query_params?: QueryParam[];
  request?: TypeReference | InlineType;
  response?: TypeReference | InlineType;
  responses: APIResponse[];
  stream_response?: boolean;
  stream_message_types?: TypeReference[];
  messages?: WebSocketMessages;
  example?: unknown;
}

interface WebSocketMessages {
  client_to_server?: TypeReference[];
  server_to_client?: TypeReference[];
  binary?: BinaryMessage[];
}

interface BinaryMessage {
  prefix: string;
  direction: 'client_to_server' | 'server_to_client' | 'bidirectional';
  description: string;
  example?: string;
}

interface QueryParam {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface APIResponse {
  status: number;
  description: string;
  body?: TypeReference;
}

interface TypeReference {
  $ref: string;
  is_array?: boolean;
}

interface InlineType {
  fields: TypeField[];
}

interface APIType {
  fields: TypeField[];
  example?: unknown;
}

interface TypeField {
  name: string;
  type: string;
  json: string;
  description?: string;
  optional?: boolean;
  const?: string;
}

interface APIEnum {
  description: string;
  values: string[];
}

interface WebSocketMessage {
  fields: TypeField[];
  example?: unknown;
}

interface SDKExamples {
  endpoints: Record<string, SDKExample>;
  management: Record<string, SDKExample>;
}

interface SDKExample {
  name: string;
  description: string;
  category: string;
  sdk_code: string;
  sdk_code_lang: string;
  sdk_output: string;
  cli_command: string;
}

interface PropertyDef {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  children?: PropertyDef[];
}

// ============================================================================
// Type formatting utilities
// ============================================================================

/**
 * Converts Go type strings to more readable documentation types.
 * Maps Go's type system to familiar TypeScript/JSON-like notation.
 */
function formatType(goType: string): string {
  // Handle pointer types (optional)
  if (goType.startsWith('*')) {
    const inner = goType.slice(1);
    // Special case for *int which is commonly "integer or null"
    if (inner === 'int' || inner === 'int64') {
      return 'number?';
    }
    if (inner === 'Duration') {
      return 'duration?';
    }
    return `${formatType(inner)}?`;
  }

  // Handle array types
  if (goType.startsWith('[]')) {
    const inner = goType.slice(2);
    return `${formatType(inner)}[]`;
  }

  // Handle map types
  if (goType.startsWith('map[')) {
    if (goType === 'map[string]interface{}' || goType === 'map[string]any') {
      return 'object';
    }
    if (goType === 'map[string]string') {
      return 'Record<string, string>';
    }
    return 'object';
  }

  // Basic type mappings
  const typeMap: Record<string, string> = {
    string: 'string',
    bool: 'boolean',
    int: 'number',
    int64: 'number',
    uint16: 'number',
    float64: 'number',
    'time.Time': 'string (ISO 8601)',
    'time.Duration': 'string (duration)',
    Duration: 'string (duration)',
    error: 'string',
    any: 'any',
    'interface{}': 'any',
  };

  return typeMap[goType] || goType;
}

// ============================================================================
// Fetch utilities
// ============================================================================

async function fetchJSON<T>(url: string): Promise<T> {
  console.log(`  Fetching ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchAllData(baseUrl: string) {
  console.log(`Fetching API schema and SDK examples from ${baseUrl}...`);

  const [schema, goExamples, jsExamples, pythonExamples, elixirExamples] =
    await Promise.all([
      fetchJSON<APISchema>(`${baseUrl}/api_schema.json`),
      fetchJSON<SDKExamples>(`${baseUrl}/go-examples.json`),
      fetchJSON<SDKExamples>(`${baseUrl}/js-examples.json`),
      fetchJSON<SDKExamples>(`${baseUrl}/python-examples.json`),
      fetchJSON<SDKExamples>(`${baseUrl}/elixir-examples.json`),
    ]);

  return { schema, goExamples, jsExamples, pythonExamples, elixirExamples };
}

// ============================================================================
// Merge utilities
// ============================================================================

function getEndpointKey(method: string, path: string): string {
  return `${method} ${path}`;
}

function findExample(
  examples: SDKExamples,
  method: string,
  path: string,
): SDKExample | undefined {
  const key = getEndpointKey(method, path);
  return examples.endpoints[key] || examples.management[key];
}

// ============================================================================
// MDX generation helpers
// ============================================================================

function escapeForMDX(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function escapeForJSON(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function generateHttpExample(
  endpoint: APIEndpoint,
  types: Record<string, APIType>,
): string {
  // For WebSocket endpoints, generate websocat example
  if (endpoint.method === 'WSS') {
    return generateWebsocatExample(endpoint);
  }

  // For REST endpoints, generate curl example
  return generateCurlExample(endpoint, types);
}

function generateWebsocatExample(endpoint: APIEndpoint): string {
  let path = endpoint.path;

  // Replace {name} with placeholder
  path = path.replace(/\{name\}/g, '{name}');

  // Replace other path params
  path = path.replace(/\{(\w+)\}/g, '{$1}');

  return `websocat \\
  "wss://api.sprites.dev${path}" \\
  -H "Authorization: Bearer $SPRITES_TOKEN"`;
}

function generateCurlExample(
  endpoint: APIEndpoint,
  types: Record<string, APIType>,
): string {
  const method = endpoint.method;
  // Replace path params with shell variables
  // Path pattern: /v1/sprites/{name}/... where first {name} is sprite, second might be service
  let path = endpoint.path;

  // Count occurrences of {name}
  const nameMatches = path.match(/\{name\}/g) || [];
  if (nameMatches.length === 1) {
    // Only one {name} - it's the sprite name
    path = path.replace('{name}', '$SPRITE_NAME');
  } else if (nameMatches.length >= 2) {
    // Two or more {name} - first is sprite, second is service/resource
    path = path.replace('{name}', '$SPRITE_NAME'); // First replacement
    path = path.replace('{name}', '$SERVICE_NAME'); // Second replacement
  }

  // Replace other path params
  path = path.replace(/\{(\w+)\}/g, (_, p) => `$${p.toUpperCase()}`);

  let curl = `curl`;

  // Add method if not GET
  if (method !== 'GET') {
    curl += ` -X ${method}`;
  }

  // Add auth header
  curl += ` \\\n  -H "Authorization: Bearer $SPRITE_TOKEN"`;

  // Add content-type for POST/PUT with body
  if ((method === 'POST' || method === 'PUT') && endpoint.request) {
    curl += ` \\\n  -H "Content-Type: application/json"`;

    // Generate example request body - prefer type's example if available
    let bodyExample: Record<string, unknown> = {};
    if ('$ref' in endpoint.request) {
      const typeName = endpoint.request.$ref.replace('#/types/', '');
      const type = types[typeName];

      // Use the type's example if available
      if (type?.example && typeof type.example === 'object') {
        bodyExample = type.example as Record<string, unknown>;
      } else if (type?.fields) {
        // Generate from fields as fallback
        for (const field of type.fields) {
          const jsonKey = field.json || field.name.toLowerCase();
          const nameLower = field.name.toLowerCase();
          if (field.type === 'string') {
            bodyExample[jsonKey] =
              nameLower === 'cmd'
                ? 'python'
                : nameLower === 'comment'
                  ? 'my checkpoint'
                  : `my-${nameLower}`;
          } else if (field.type === '[]string') {
            bodyExample[jsonKey] =
              nameLower === 'args' ? ['-m', 'http.server', '8000'] : [];
          } else if (field.type === '*int' || field.type === 'int') {
            bodyExample[jsonKey] = nameLower.includes('port') ? 8000 : 0;
          }
        }
      }
    }
    if (Object.keys(bodyExample).length > 0) {
      curl += ` \\\n  -d '${JSON.stringify(bodyExample)}'`;
    }
  }

  // Add URL
  curl += ` \\\n  "https://api.sprites.dev${path}"`;

  return curl;
}

function generateExamplesArray(
  endpoint: APIEndpoint,
  types: Record<string, APIType>,
  goEx?: SDKExample,
  jsEx?: SDKExample,
  pyEx?: SDKExample,
  elixirEx?: SDKExample,
): string {
  const examples: string[] = [];

  // CLI example (from any SDK that has it)
  const cliCommand = goEx?.cli_command || jsEx?.cli_command;
  if (cliCommand?.trim()) {
    examples.push(
      `{ language: 'cli', code: \`${escapeForMDX(cliCommand.trim())}\` }`,
    );
  }

  if (goEx?.sdk_code) {
    examples.push(
      `{ language: 'go', code: \`${escapeForMDX(goEx.sdk_code.trim())}\` }`,
    );
  }

  if (jsEx?.sdk_code) {
    examples.push(
      `{ language: 'javascript', code: \`${escapeForMDX(jsEx.sdk_code.trim())}\` }`,
    );
  }

  if (pyEx?.sdk_code) {
    examples.push(
      `{ language: 'python', code: \`${escapeForMDX(pyEx.sdk_code.trim())}\` }`,
    );
  }

  if (elixirEx?.sdk_code) {
    examples.push(
      `{ language: 'elixir', code: \`${escapeForMDX(elixirEx.sdk_code.trim())}\` }`,
    );
  }

  // Always add HTTP example as fallback (or primary if no SDK examples)
  const httpExample = generateHttpExample(endpoint, types);
  examples.push(`{ language: 'curl', code: \`${escapeForMDX(httpExample)}\` }`);

  return `[
        ${examples.join(',\n        ')}
      ]`;
}

function convertQueryParamsToProperties(params: QueryParam[]): PropertyDef[] {
  return params.map((p) => ({
    name: p.name,
    type: formatType(p.type),
    required: p.required,
    description: p.description,
  }));
}

function convertTypeFieldsToProperties(
  fields: TypeField[],
  types: Record<string, APIType>,
  depth = 0,
): PropertyDef[] {
  if (depth > 3) return []; // Prevent infinite recursion

  return fields.map((f) => {
    // Check if the type is a reference to another type (before formatting)
    const typeMatch = f.type.match(/^(\w+)(\[\])?$/);
    let children: PropertyDef[] | undefined;

    if (typeMatch) {
      const typeName = typeMatch[1];
      const referencedType = types[typeName];
      if (referencedType?.fields) {
        children = convertTypeFieldsToProperties(
          referencedType.fields,
          types,
          depth + 1,
        );
      }
    }

    const prop: PropertyDef = {
      name: f.json || f.name,
      type: formatType(f.type),
      required: !f.optional,
      description: f.description,
      children,
    };

    return prop;
  });
}

function generatePropertiesArray(properties: PropertyDef[]): string {
  const formatProp = (p: PropertyDef): string => {
    const parts = [
      `name: '${escapeForJSON(p.name)}'`,
      `type: '${escapeForJSON(p.type)}'`,
    ];

    if (p.required) {
      parts.push('required: true');
    }

    if (p.description) {
      parts.push(`description: '${escapeForJSON(p.description)}'`);
    }

    if (p.children && p.children.length > 0) {
      parts.push(`children: [${p.children.map(formatProp).join(', ')}]`);
    }

    return `{ ${parts.join(', ')} }`;
  };

  return `[${properties.map(formatProp).join(', ')}]`;
}

function generateResponseCode(
  endpoint: APIEndpoint,
  types: Record<string, APIType>,
): string {
  // Priority 1: Use endpoint-level example if available
  if (endpoint.example) {
    return JSON.stringify(endpoint.example, null, 2);
  }

  // Priority 2: Try to find a 200 response with a body and use type's example
  const successResponse = endpoint.responses.find(
    (r) => r.status === 200 && r.body,
  );

  if (successResponse?.body?.$ref) {
    const typeName = successResponse.body.$ref.replace('#/types/', '');
    const type = types[typeName];
    if (type?.example) {
      return JSON.stringify(type.example, null, 2);
    }
  }

  // Priority 3: Check response type reference
  if (endpoint.response && '$ref' in endpoint.response) {
    const typeName = endpoint.response.$ref.replace('#/types/', '');
    const type = types[typeName];
    if (type?.example) {
      return JSON.stringify(type.example, null, 2);
    }
  }

  // Fallback: Generate placeholder from inline response fields
  if (endpoint.response && 'fields' in endpoint.response) {
    const example: Record<string, unknown> = {};
    for (const field of endpoint.response.fields) {
      example[field.json] = `<${formatType(field.type)}>`;
    }
    return JSON.stringify(example, null, 2);
  }

  return '';
}

// ============================================================================
// WebSocket & Streaming documentation helpers
// ============================================================================

function generateWebSocketMessagesDocs(
  messages: WebSocketMessages,
  websocketMessages: Record<string, WebSocketMessage>,
  _types: Record<string, APIType>,
): string {
  if (!messages) return '';

  let content = '';

  // Client to server messages
  if (messages.client_to_server && messages.client_to_server.length > 0) {
    content += `
### Client → Server Messages

`;
    for (const ref of messages.client_to_server) {
      const msgName = ref.$ref.replace('#/websocket_messages/', '');
      const msg = websocketMessages[msgName];
      if (msg) {
        content += `#### ${msgName}

`;
        if (msg.fields && msg.fields.length > 0) {
          content += `| Field | Type | Description |
|-------|------|-------------|
`;
          for (const field of msg.fields) {
            const constVal = field.const
              ? ` (const: \`"${field.const}"\`)`
              : '';
            content += `| \`${field.json}\` | \`${formatType(field.type)}\` | ${field.description || ''}${constVal} |
`;
          }
        }
        if (msg.example) {
          content += `
\`\`\`json
${JSON.stringify(msg.example, null, 2)}
\`\`\`

`;
        }
      }
    }
  }

  // Server to client messages
  if (messages.server_to_client && messages.server_to_client.length > 0) {
    content += `
### Server → Client Messages

`;
    for (const ref of messages.server_to_client) {
      const msgName = ref.$ref.replace('#/websocket_messages/', '');
      const msg = websocketMessages[msgName];
      if (msg) {
        content += `#### ${msgName}

`;
        if (msg.fields && msg.fields.length > 0) {
          content += `| Field | Type | Description |
|-------|------|-------------|
`;
          for (const field of msg.fields) {
            const constVal = field.const
              ? ` (const: \`"${field.const}"\`)`
              : '';
            content += `| \`${field.json}\` | \`${formatType(field.type)}\` | ${field.description || ''}${constVal} |
`;
          }
        }
        if (msg.example) {
          content += `
\`\`\`json
${JSON.stringify(msg.example, null, 2)}
\`\`\`

`;
        }
      }
    }
  }

  // Binary protocol docs removed - too low-level for public docs

  return content;
}

function generateStreamingEventsDocs(
  streamTypes: TypeReference[],
  types: Record<string, APIType>,
): string {
  if (!streamTypes || streamTypes.length === 0) return '';

  let content = `
### Streaming Events

This endpoint returns streaming NDJSON. Each line is one of these event types:

`;

  for (const ref of streamTypes) {
    const typeName = ref.$ref.replace('#/types/', '');
    const type = types[typeName];
    if (type) {
      // Find the type field to determine event type
      const typeField = type.fields.find((f) => f.json === 'type');
      const eventType =
        typeField?.const || typeName.replace(/Event$/, '').toLowerCase();

      content += `#### \`${eventType}\`

`;
      if (type.fields && type.fields.length > 0) {
        content += `| Field | Type | Description |
|-------|------|-------------|
`;
        for (const field of type.fields) {
          const constVal = field.const ? ` (const: \`"${field.const}"\`)` : '';
          content += `| \`${field.json}\` | \`${formatType(field.type)}\` | ${field.description || ''}${constVal} |
`;
        }
      }
      if (type.example) {
        content += `
\`\`\`json
${JSON.stringify(type.example)}
\`\`\`

`;
      }
    }
  }

  return content;
}

function generateResponseStatusCodes(responses: APIResponse[]): string {
  if (!responses || responses.length === 0) return '';

  const rows = responses.map((r) => {
    // Color based on status code range
    const color =
      r.status < 300
        ? 'var(--sl-color-green)'
        : r.status < 400
          ? 'var(--sl-color-blue)'
          : r.status < 500
            ? 'var(--sl-color-orange)'
            : 'var(--sl-color-red)';

    return `| <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '${color}' }} />\`${r.status}\`</span> | ${r.description} |`;
  });

  return `
### Responses

| Status | Description |
|--------|-------------|
${rows.join('\n')}
`;
}

// ============================================================================
// Page generation - Double-pane layout
// ============================================================================

function generateEndpointSection(
  endpoint: APIEndpoint,
  types: Record<string, APIType>,
  websocketMessages: Record<string, WebSocketMessage>,
  goEx?: SDKExample,
  jsEx?: SDKExample,
  pyEx?: SDKExample,
  elixirEx?: SDKExample,
): string {
  // Keep WSS method for WebSocket endpoints to display correct protocol
  const method = endpoint.method;

  const examplesArray = generateExamplesArray(
    endpoint,
    types,
    goEx,
    jsEx,
    pyEx,
    elixirEx,
  );
  const responseCode = generateResponseCode(endpoint, types);

  // Build query params properties
  const queryProps = endpoint.query_params
    ? convertQueryParamsToProperties(endpoint.query_params)
    : [];

  // Build request body properties
  let requestProps: PropertyDef[] = [];
  if (endpoint.request) {
    if ('$ref' in endpoint.request) {
      const typeName = endpoint.request.$ref.replace('#/types/', '');
      const type = types[typeName];
      if (type?.fields) {
        requestProps = convertTypeFieldsToProperties(type.fields, types);
      }
    } else if ('fields' in endpoint.request) {
      requestProps = convertTypeFieldsToProperties(
        endpoint.request.fields,
        types,
      );
    }
  }

  // Generate additional documentation sections
  const responseStatusCodes = generateResponseStatusCodes(endpoint.responses);
  const streamingEventsDocs =
    endpoint.stream_response && endpoint.stream_message_types
      ? generateStreamingEventsDocs(endpoint.stream_message_types, types)
      : '';
  const websocketDocs = endpoint.messages
    ? generateWebSocketMessagesDocs(endpoint.messages, websocketMessages, types)
    : '';

  // Generate anchor ID from endpoint name
  const anchorId = endpoint.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let content = `
<div id="${anchorId}">
<MethodPage client:load>
  <MethodPageLeft client:load>
    <MethodHeader
      method="${method}"
      path="${endpoint.path}"
      title="${escapeForJSON(endpoint.name)}"
      description="${escapeForJSON(endpoint.description)}"
      client:load
    />
`;

  if (queryProps.length > 0) {
    content += `
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Query Parameters</h3>
      <PropertyTree properties={${generatePropertiesArray(queryProps)}} client:load />
    </div>
`;
  }

  if (requestProps.length > 0) {
    content += `
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Request Body</h3>
      <PropertyTree properties={${generatePropertiesArray(requestProps)}} client:load />
    </div>
`;
  }

  // Add response status codes
  if (responseStatusCodes) {
    content += `
    <div style={{ marginTop: '2rem' }}>
${responseStatusCodes}
    </div>
`;
  }

  // Add WebSocket documentation for websocket endpoints
  if (websocketDocs) {
    content += `
    <div style={{ marginTop: '2rem' }}>
${websocketDocs}
    </div>
`;
  }

  // Add streaming events documentation
  if (streamingEventsDocs) {
    content += `
    <div style={{ marginTop: '2rem' }}>
${streamingEventsDocs}
    </div>
`;
  }

  content += `  </MethodPageLeft>

  <MethodPageRight client:load>
    <CodeSnippets
      examples={${examplesArray}}`;

  if (responseCode) {
    content += `
      response={\`${escapeForMDX(responseCode)}\`}`;
  }

  content += `
    />
  </MethodPageRight>
</MethodPage>
</div>
`;

  return content;
}

function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    sprites: 'Sprites',
    exec: 'Exec',
    checkpoints: 'Checkpoints',
    services: 'Services',
    proxy: 'HTTP Proxy',
    policy: 'Policy',
    organization: 'Organization',
    tokens: 'Tokens',
    files: 'Files',
    filesystem: 'Filesystem',
    attach: 'Attach',
  };
  return (
    titles[category] || category.charAt(0).toUpperCase() + category.slice(1)
  );
}

// Manual pages that are not generated from schema but should be included
interface ManualEndpoint {
  method: string;
  title: string;
}

interface ManualPage {
  category: string;
  title: string;
  description: string;
  endpoints?: ManualEndpoint[];
}

const MANUAL_PAGES: ManualPage[] = [
  {
    category: 'sprites',
    title: 'Sprites',
    description: 'Create, list, update, and delete Sprites',
    endpoints: [
      { method: 'POST', title: 'Create Sprite' },
      { method: 'GET', title: 'List Sprites' },
      { method: 'GET', title: 'Get Sprite' },
      { method: 'PUT', title: 'Update Sprite' },
      { method: 'DELETE', title: 'Delete Sprite' },
    ],
  },
];

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    sprites: 'Create, list, update, and delete Sprites',
    exec: 'Execute commands in Sprites via WebSocket',
    checkpoints: 'Create, list, and restore environment snapshots',
    services: 'Manage background services running in Sprites',
    proxy: 'Forward HTTP requests to services inside Sprites',
    policy: 'Manage access control policies',
    organization: 'Organization settings and information',
    tokens: 'Create and manage API tokens',
    files: 'Upload and download files',
    filesystem: 'Browse and manage the filesystem',
    attach: 'Interactive terminal sessions via WebSocket',
  };
  return (
    descriptions[category] || `${getCategoryTitle(category)} API endpoints`
  );
}

async function generateCategoryPage(
  category: string,
  endpoints: APIEndpoint[],
  types: Record<string, APIType>,
  websocketMessages: Record<string, WebSocketMessage>,
  allExamples: {
    go: SDKExamples;
    js: SDKExamples;
    python: SDKExamples;
    elixir: SDKExamples;
  },
): Promise<string> {
  const title = getCategoryTitle(category);
  const description = getCategoryDescription(category);

  const hasWebSocket = endpoints.some((e) => e.protocol === 'websocket');

  let content = `---
title: ${title} API
description: ${description}
tableOfContents: false
---

import {
  MethodPage,
  MethodPageLeft,
  MethodPageRight,
  MethodHeader,
  PropertyTree,
  Callout,
} from '@/components/react';
import CodeSnippets from '@/components/CodeSnippets.astro';

<div className="api-full-width">

`;

  if (hasWebSocket) {
    content += `<Callout type="info" client:load>
  **WebSocket Endpoints** — Some endpoints in this section use WebSocket for bidirectional communication. The SDK handles the connection protocol automatically.
</Callout>

`;
  }

  for (const endpoint of endpoints) {
    const goEx = findExample(allExamples.go, endpoint.method, endpoint.path);
    const jsEx = findExample(allExamples.js, endpoint.method, endpoint.path);
    const pyEx = findExample(
      allExamples.python,
      endpoint.method,
      endpoint.path,
    );
    const elixirEx = findExample(
      allExamples.elixir,
      endpoint.method,
      endpoint.path,
    );

    content += `${generateEndpointSection(endpoint, types, websocketMessages, goEx, jsEx, pyEx, elixirEx)}

---

`;
  }

  // Close the api-full-width wrapper
  content += `</div>
`;

  return content;
}

async function generateIndexPage(
  categories: string[],
  schema: APISchema,
  versionId: string,
): Promise<string> {
  return `---
title: API Reference
description: REST and WebSocket API for managing Sprites programmatically
---

import { LinkCard, CardGrid, Callout, VersionSelector } from '@/components/react';

The Sprites API allows you to manage Sprites programmatically via HTTP and WebSocket requests.

## Base URL

\`\`\`
https://api.sprites.dev
\`\`\`

## Authentication

All API requests require authentication via Bearer token:

\`\`\`bash
curl -H "Authorization: Bearer $SPRITE_TOKEN" \\
  https://api.sprites.dev/v1/sprites
\`\`\`

<Callout type="tip" client:load>
Create a token at [sprites.dev/account](https://sprites.dev/account), or generate one via the CLI with \`sprite org auth\`.
</Callout>

## API Categories

<CardGrid client:load>
${MANUAL_PAGES.map(
  (page) => `  <LinkCard
    href="/api/${versionId}/${page.category}"
    title="${page.title}"
    description="${page.description}"
    icon="code"
    client:load
  />`,
).join('\n')}
${categories
  .map(
    (cat) => `  <LinkCard
    href="/api/${versionId}/${cat}"
    title="${getCategoryTitle(cat)}"
    description="${getCategoryDescription(cat)}"
    icon="code"
    client:load
  />`,
  )
  .join('\n')}
</CardGrid>

## SDK Libraries

For a better developer experience, use our official SDKs:

<CardGrid client:load>
  <LinkCard
    href="/sdks/javascript"
    title="JavaScript SDK"
    description="TypeScript/JavaScript client"
    icon="code"
    client:load
  />
  <LinkCard
    href="/sdks/go"
    title="Go SDK"
    description="Native Go client"
    icon="code"
    client:load
  />
  <LinkCard
    href="/sdks/python"
    title="Python SDK"
    description="Python client library"
    icon="code"
    client:load
  />
  <LinkCard
    href="/sdks/elixir"
    title="Elixir SDK"
    description="Elixir client library"
    icon="code"
    client:load
  />
</CardGrid>

## Version

API Version: \`${schema.version}\`
`;
}

async function generateTypesPage(
  types: Record<string, APIType>,
  enums: Record<string, APIEnum>,
  websocketMessages: Record<string, WebSocketMessage>,
): Promise<string> {
  let content = `---
title: Type Definitions
description: API type, enum, and WebSocket message definitions
tableOfContents: false
---

import { PropertyTree } from '@/components/react';

<div className="api-full-width">

This page documents the data types used throughout the Sprites API.

## Types

`;

  for (const [name, type] of Object.entries(types)) {
    const properties = type.fields.map((f) => ({
      name: f.json || f.name,
      type: formatType(f.type),
      required: !f.optional,
      description:
        f.description || `${f.const ? ` (const: \`"${f.const}"\`)` : ''}`,
    }));

    content += `### ${name}

<PropertyTree properties={${JSON.stringify(properties)}} client:load />

`;

    // Add example if available
    if (type.example) {
      content += `**Example:**
\`\`\`json
${JSON.stringify(type.example, null, 2)}
\`\`\`

`;
    }
  }

  content += `## Enums

`;

  for (const [name, enumDef] of Object.entries(enums)) {
    content += `### ${name}

${enumDef.description}

| Value |
|-------|
${enumDef.values.map((v) => `| \`${v}\` |`).join('\n')}

`;
  }

  content += `## WebSocket Messages

These message types are used for WebSocket communication in exec and proxy endpoints.

`;

  for (const [name, msg] of Object.entries(websocketMessages)) {
    const properties = msg.fields.map((f) => ({
      name: f.json || f.name,
      type: formatType(f.type),
      required: !f.optional,
      description:
        (f.description || '') + (f.const ? ` (const: \`"${f.const}"\`)` : ''),
    }));

    content += `### ${name}

<PropertyTree properties={${JSON.stringify(properties)}} client:load />

`;

    // Add example if available
    if (msg.example) {
      content += `**Example:**
\`\`\`json
${JSON.stringify(msg.example, null, 2)}
\`\`\`

`;
    }
  }

  // Close the api-full-width wrapper
  content += `</div>
`;

  return content;
}

// ============================================================================
// Sidebar config generation
// ============================================================================

interface SidebarBadge {
  text: string;
  variant: 'note' | 'tip' | 'caution' | 'danger' | 'success' | 'default';
  class?: string;
}

interface SidebarLink {
  label: string;
  slug?: string;
  link?: string;
  badge?: SidebarBadge;
  attrs?: Record<string, string>;
}

interface SidebarGroup {
  label: string;
  collapsed?: boolean;
  items: (SidebarLink | SidebarGroup)[];
}

type SidebarItem = SidebarLink | SidebarGroup;

function getMethodAttrs(method: string): Record<string, string> {
  return { 'data-method': method.toLowerCase() };
}

function slugifyEndpoint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateSidebarItems(
  categories: string[],
  endpointsByCategory: Record<string, APIEndpoint[]>,
  versionId: string,
): SidebarItem[] {
  const items: SidebarItem[] = [
    { label: 'Overview', slug: `api/${versionId}` },
  ];

  // Add manual pages (Sprites) with nested endpoint items
  for (const page of MANUAL_PAGES) {
    if (page.endpoints && page.endpoints.length > 0) {
      // Create a group with nested endpoint items
      const endpointItems: SidebarLink[] = page.endpoints.map((ep) => ({
        label: ep.title,
        link: `/api/${versionId}/${page.category}#${slugifyEndpoint(ep.title)}`,
        attrs: getMethodAttrs(ep.method),
      }));
      items.push({
        label: page.title,
        collapsed: true,
        items: endpointItems,
      });
    } else {
      items.push({
        label: page.title,
        slug: `api/${versionId}/${page.category}`,
      });
    }
  }

  // Add generated categories with nested endpoint items
  for (const category of categories) {
    const endpoints = endpointsByCategory[category] || [];
    if (endpoints.length > 0) {
      const endpointItems: SidebarLink[] = endpoints.map((ep) => ({
        label: ep.name,
        link: `/api/${versionId}/${category}#${slugifyEndpoint(ep.name)}`,
        attrs: getMethodAttrs(ep.method),
      }));
      items.push({
        label: getCategoryTitle(category),
        collapsed: true,
        items: endpointItems,
      });
    } else {
      items.push({
        label: getCategoryTitle(category),
        slug: `api/${versionId}/${category}`,
      });
    }
  }

  items.push({ label: 'Type Definitions', slug: `api/${versionId}/types` });

  return items;
}

function serializeSidebarItem(item: SidebarItem, indent: number): string {
  const pad = '  '.repeat(indent);

  // Check if it's a group (has items array)
  if ('items' in item) {
    const group = item as SidebarGroup;
    const nestedItems = group.items
      .map((i) => serializeSidebarItem(i, indent + 1))
      .join(',\n');
    return `${pad}{
${pad}  label: '${group.label}',
${pad}  collapsed: ${group.collapsed ?? true},
${pad}  items: [
${nestedItems}
${pad}  ]
${pad}}`;
  }

  // It's a link
  const sidebarLink = item as SidebarLink;
  const parts = [`label: '${sidebarLink.label}'`];
  if (sidebarLink.link) {
    parts.push(`link: '${sidebarLink.link}'`);
  } else if (sidebarLink.slug) {
    parts.push(`slug: '${sidebarLink.slug}'`);
  }
  if (sidebarLink.badge) {
    parts.push(
      `badge: { text: '${sidebarLink.badge.text}', variant: '${sidebarLink.badge.variant}'${sidebarLink.badge.class ? `, class: '${sidebarLink.badge.class}'` : ''} }`,
    );
  }
  if (sidebarLink.attrs) {
    const attrsStr = Object.entries(sidebarLink.attrs)
      .map(([k, v]) => `'${k}': '${v}'`)
      .join(', ');
    parts.push(`attrs: { ${attrsStr} }`);
  }
  return `${pad}{ ${parts.join(', ')} }`;
}

function generateSidebarConfig(
  categories: string[],
  endpointsByCategory: Record<string, APIEndpoint[]>,
  versionId: string,
): string {
  const items = generateSidebarItems(
    categories,
    endpointsByCategory,
    versionId,
  );

  const itemsStr = items
    .map((item) => serializeSidebarItem(item, 3))
    .join(',\n');

  return `
// Auto-generated API sidebar items
// Copy this to src/lib/sidebar.ts if you need to update the API section
export const apiSidebarItems = [
${itemsStr}
];
`;
}

// ============================================================================
// Manual page handling - shared across all versions
// ============================================================================

const MANUAL_PAGES_DIR = join(OUTPUT_BASE_DIR, '_manual');

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy manual pages from _manual/ directory to a specific version directory.
 * Manual pages are shared across all versions.
 */
async function copyManualPagesToVersion(versionId: string): Promise<void> {
  for (const page of MANUAL_PAGES) {
    const sourcePath = join(MANUAL_PAGES_DIR, `${page.category}.mdx`);
    const destPath = join(OUTPUT_BASE_DIR, versionId, `${page.category}.mdx`);

    if (await fileExists(sourcePath)) {
      const content = await readFile(sourcePath, 'utf-8');
      await writeFile(destPath, content);
      console.log(`  📄 Copied manual page: ${page.category}.mdx`);
    }
  }
}

// ============================================================================
// Root redirect page generation
// ============================================================================

async function generateRootRedirectPage(
  defaultVersion: APIVersion,
): Promise<string> {
  return `---
title: API Reference
description: REST and WebSocket API for managing Sprites programmatically
---

import { Callout } from '@/components/react';

<meta httpEquiv="refresh" content="0; url=/api/${defaultVersion.id}/" />

<Callout type="info" client:load>
  Redirecting to the latest API documentation...
</Callout>

If you are not redirected automatically, [click here](/api/${defaultVersion.id}/).
`;
}

// ============================================================================
// Version-specific documentation generation
// ============================================================================

async function generateVersionDocs(version: APIVersion): Promise<{
  categories: string[];
  endpointsByCategory: Record<string, APIEndpoint[]>;
}> {
  console.log(`\n📦 Generating docs for ${version.label} (${version.id})...`);

  // Fetch all data for this version
  const { schema, goExamples, jsExamples, pythonExamples, elixirExamples } =
    await fetchAllData(version.schemaUrl);

  const allExamples = {
    go: goExamples,
    js: jsExamples,
    python: pythonExamples,
    elixir: elixirExamples,
  };

  console.log(`  📊 Found ${schema.endpoints.length} endpoints`);
  console.log(`  📦 Found ${Object.keys(schema.types).length} types`);
  console.log(`  🏷️  Found ${Object.keys(schema.enums).length} enums`);
  console.log(
    `  📨 Found ${Object.keys(schema.websocket_messages).length} WebSocket message types`,
  );

  // Group endpoints by category
  const endpointsByCategory: Record<string, APIEndpoint[]> = {};
  for (const endpoint of schema.endpoints) {
    const category = endpoint.category || 'other';
    if (!endpointsByCategory[category]) {
      endpointsByCategory[category] = [];
    }
    endpointsByCategory[category].push(endpoint);
  }

  const categories = Object.keys(endpointsByCategory).sort();
  console.log(`  📁 Categories: ${categories.join(', ')}`);

  // Create version-specific output directory
  const outputDir = join(OUTPUT_BASE_DIR, version.id);
  await mkdir(outputDir, { recursive: true });

  // Generate index page
  console.log(`  📝 Generating ${version.id}/index.mdx...`);
  const indexContent = await generateIndexPage(categories, schema, version.id);
  await writeFile(join(outputDir, 'index.mdx'), indexContent);

  // Generate category pages
  for (const category of categories) {
    console.log(`  📝 Generating ${version.id}/${category}.mdx...`);
    const content = await generateCategoryPage(
      category,
      endpointsByCategory[category],
      schema.types,
      schema.websocket_messages,
      allExamples,
    );
    await writeFile(join(outputDir, `${category}.mdx`), content);
  }

  // Generate types page
  console.log(`  📝 Generating ${version.id}/types.mdx...`);
  const typesContent = await generateTypesPage(
    schema.types,
    schema.enums,
    schema.websocket_messages,
  );
  await writeFile(join(outputDir, 'types.mdx'), typesContent);

  // Generate sidebar config snippet
  console.log(`  📝 Generating ${version.id}/_sidebar-config.ts...`);
  const sidebarConfig = generateSidebarConfig(
    categories,
    endpointsByCategory,
    version.id,
  );
  await writeFile(join(outputDir, '_sidebar-config.ts'), sidebarConfig);

  console.log(
    `  ✅ Generated ${categories.length + 2} MDX files in ${outputDir}`,
  );

  return { categories, endpointsByCategory };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(
    '🚀 Generating API documentation (versioned, double-pane layout)...',
  );
  console.log(
    `📋 Versions to generate: ${API_VERSIONS.map((v) => v.id).join(', ')}`,
  );

  // Clean output directory (but preserve _manual/)
  console.log('\n🧹 Cleaning output directory...');
  try {
    const entries = await readdir(OUTPUT_BASE_DIR);
    for (const entry of entries) {
      if (entry !== '_manual') {
        await rm(join(OUTPUT_BASE_DIR, entry), {
          recursive: true,
          force: true,
        });
      }
    }
  } catch {
    // Directory may not exist
    await mkdir(OUTPUT_BASE_DIR, { recursive: true });
  }

  // Generate docs for each version
  for (const version of API_VERSIONS) {
    await generateVersionDocs(version);

    // Copy shared manual pages to this version
    await copyManualPagesToVersion(version.id);
  }

  // Generate root redirect page
  console.log('\n📝 Generating root redirect page...');
  const redirectContent = await generateRootRedirectPage(DEFAULT_VERSION);
  await writeFile(join(OUTPUT_BASE_DIR, 'index.mdx'), redirectContent);

  console.log('\n🎉 All versions generated successfully!');
  console.log(`   Default version: ${DEFAULT_VERSION.id}`);
}

main().catch((error) => {
  console.error('❌ Error generating API docs:', error);
  process.exit(1);
});
