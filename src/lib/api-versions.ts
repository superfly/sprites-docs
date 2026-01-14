/**
 * API Version Configuration
 * Defines available API documentation versions for the version selector.
 */

export interface APIVersion {
  /** Version identifier used in URLs, e.g., "dev-latest", "v1.0.0" */
  id: string;
  /** Display label for the version selector */
  label: string;
  /** Base URL for fetching schema and examples */
  schemaUrl: string;
  /** Whether this is the default/latest version */
  isLatest?: boolean;
  /** Badge type for visual indicator */
  badge?: 'dev' | 'stable' | 'deprecated';
}

export const API_VERSIONS: APIVersion[] = [
  {
    id: 'dev-latest',
    label: 'Development',
    schemaUrl: 'https://sprites-binaries.t3.storage.dev/api/dev-latest',
    isLatest: true,
    badge: 'dev',
  },
  // Future versions will be added here:
  // {
  //   id: 'v1.0.0',
  //   label: 'v1.0.0',
  //   schemaUrl: 'https://sprites-binaries.t3.storage.dev/api/v1.0.0',
  //   badge: 'stable',
  // },
];

export const DEFAULT_VERSION =
  API_VERSIONS.find((v) => v.isLatest) || API_VERSIONS[0];

/**
 * Get a version by its ID
 */
export function getVersion(id: string): APIVersion | undefined {
  return API_VERSIONS.find((v) => v.id === id);
}

/**
 * Extract version ID from a URL path
 * e.g., "/api/dev-latest/exec" → "dev-latest"
 */
export function getVersionFromPath(path: string): string | null {
  const match = path.match(/^\/api\/([^/]+)/);
  if (match) {
    const versionId = match[1];
    // Verify it's a valid version
    if (API_VERSIONS.some((v) => v.id === versionId)) {
      return versionId;
    }
  }
  return null;
}

/**
 * Get the page slug from a versioned API path
 * e.g., "/api/dev-latest/exec" → "exec"
 * e.g., "/api/dev-latest/" → ""
 */
export function getPageFromPath(path: string): string {
  const match = path.match(/^\/api\/[^/]+\/?(.*?)$/);
  return match ? match[1].replace(/\/$/, '') : '';
}

/**
 * Build a versioned API path
 * e.g., ("v1.0.0", "exec") → "/api/v1.0.0/exec"
 */
export function buildVersionedPath(versionId: string, page: string): string {
  const basePath = `/api/${versionId}`;
  return page ? `${basePath}/${page}` : basePath;
}
