// TypeScript types for API schema and SDK examples
// Fetched from https://sprites-binaries.t3.storage.dev/api/dev-latest/

const BASE_URL = 'https://sprites-binaries.t3.storage.dev/api/dev-latest';

// ============================================================================
// API Schema Types
// ============================================================================

export interface APISchema {
  description: string;
  version: string;
  generated: string;
  endpoints: APIEndpoint[];
  types: Record<string, APIType>;
  enums: Record<string, APIEnum>;
  websocket_messages: Record<string, WebSocketMessage>;
  examples: string[];
}

export interface APIEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'DELETE' | 'WSS';
  description: string;
  handler: string;
  protocol: 'http' | 'websocket';
  category: string;
  visibility: 'public';
  middleware: string[];
  query_params?: QueryParam[];
  request?: TypeReference | InlineType;
  response?: TypeReference | InlineType;
  stream_response?: boolean;
  stream_message_types?: TypeReference[];
  messages?: {
    client_to_server?: TypeReference[];
    server_to_client?: TypeReference[];
    binary?: BinaryProtocol[];
  };
  responses: APIResponse[];
  example?: unknown;
}

export interface QueryParam {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface APIResponse {
  status: number;
  description: string;
  body?: TypeReference;
}

export interface TypeReference {
  $ref: string;
  is_array?: boolean;
}

export interface InlineType {
  fields: TypeField[];
}

export interface BinaryProtocol {
  prefix: string;
  direction: 'client_to_server' | 'server_to_client' | 'bidirectional';
  description: string;
  example: string;
}

export interface APIType {
  fields: TypeField[];
  example?: unknown;
}

export interface TypeField {
  name: string;
  type: string;
  json: string;
  description?: string;
  optional?: boolean;
  const?: unknown;
}

export interface APIEnum {
  description: string;
  values: string[];
}

export interface WebSocketMessage {
  fields: TypeField[];
  example?: unknown;
}

// ============================================================================
// SDK Examples Types
// ============================================================================

export interface SDKExamples {
  generated: string;
  sprite_version: string;
  sdk_version: string;
  sdk: string;
  endpoints: Record<string, SDKExample>;
  management: Record<string, SDKExample>;
}

export interface SDKExample {
  name: string;
  description: string;
  category: string;
  sdk_code: string;
  sdk_code_lang: string;
  sdk_output: string;
  output_lang: string;
  cli_command: string;
}

// ============================================================================
// Merged Types (Schema + Examples)
// ============================================================================

export interface MergedEndpoint extends APIEndpoint {
  examples: {
    cli?: string;
    go?: string;
    javascript?: string;
    python?: string;
    elixir?: string;
  };
  sdk_outputs?: {
    go?: string;
    javascript?: string;
    python?: string;
    elixir?: string;
  };
}

export interface EndpointsByCategory {
  [category: string]: MergedEndpoint[];
}

// ============================================================================
// Fetch Utilities
// ============================================================================

export async function fetchAPISchema(): Promise<APISchema> {
  const response = await fetch(`${BASE_URL}/api_schema.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch API schema: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSDKExamples(
  sdk: 'go' | 'js' | 'python' | 'elixir',
): Promise<SDKExamples> {
  const response = await fetch(`${BASE_URL}/${sdk}-examples.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sdk} examples: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchAllSDKExamples(): Promise<{
  go: SDKExamples;
  js: SDKExamples;
  python: SDKExamples;
  elixir: SDKExamples;
}> {
  const [go, js, python, elixir] = await Promise.all([
    fetchSDKExamples('go'),
    fetchSDKExamples('js'),
    fetchSDKExamples('python'),
    fetchSDKExamples('elixir'),
  ]);
  return { go, js, python, elixir };
}

// ============================================================================
// Merge Utilities
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

export async function fetchAndMergeAPIData(): Promise<{
  schema: APISchema;
  endpointsByCategory: EndpointsByCategory;
}> {
  const [schema, allExamples] = await Promise.all([
    fetchAPISchema(),
    fetchAllSDKExamples(),
  ]);

  const endpointsByCategory: EndpointsByCategory = {};

  for (const endpoint of schema.endpoints) {
    const goExample = findExample(
      allExamples.go,
      endpoint.method,
      endpoint.path,
    );
    const jsExample = findExample(
      allExamples.js,
      endpoint.method,
      endpoint.path,
    );
    const pyExample = findExample(
      allExamples.python,
      endpoint.method,
      endpoint.path,
    );
    const elixirExample = findExample(
      allExamples.elixir,
      endpoint.method,
      endpoint.path,
    );

    const mergedEndpoint: MergedEndpoint = {
      ...endpoint,
      examples: {
        cli: goExample?.cli_command || jsExample?.cli_command || '',
        go: goExample?.sdk_code,
        javascript: jsExample?.sdk_code,
        python: pyExample?.sdk_code,
        elixir: elixirExample?.sdk_code,
      },
      sdk_outputs: {
        go: goExample?.sdk_output,
        javascript: jsExample?.sdk_output,
        python: pyExample?.sdk_output,
        elixir: elixirExample?.sdk_output,
      },
    };

    const category = endpoint.category || 'other';
    if (!endpointsByCategory[category]) {
      endpointsByCategory[category] = [];
    }
    endpointsByCategory[category].push(mergedEndpoint);
  }

  return { schema, endpointsByCategory };
}

// ============================================================================
// Helper to resolve type references
// ============================================================================

export function resolveTypeRef(
  ref: TypeReference | undefined,
  types: Record<string, APIType>,
): APIType | undefined {
  if (!ref || !ref.$ref) return undefined;
  const typeName = ref.$ref.replace('#/types/', '');
  return types[typeName];
}

export function getTypeName(ref: TypeReference | undefined): string {
  if (!ref || !ref.$ref) return 'unknown';
  const name = ref.$ref.replace('#/types/', '');
  return ref.is_array ? `${name}[]` : name;
}
