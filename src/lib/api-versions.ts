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
    id: 'v0.0.1-rc30',
    label: 'v0.0.1-rc30',
    schemaUrl: 'https://sprites-binaries.t3.storage.dev/api/v0.0.1-rc30',
    isLatest: true,
    badge: 'stable',
  },
  {
    id: 'dev-latest',
    label: 'Development',
    schemaUrl: 'https://sprites-binaries.t3.storage.dev/api/dev-latest',
    badge: 'dev',
  },
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
 * Extract version ID from a URL path (handles both raw IDs and slugified versions).
 * e.g., "/api/dev-latest/exec" → "dev-latest"
 * e.g., "/api/v001-rc30/exec" → "v0.0.1-rc30"
 */
export function getVersionFromPath(path: string): string | null {
  const match = path.match(/^\/api\/([^/]+)/);
  if (match) {
    const slugOrId = match[1];
    // Check for exact ID match first
    const exactMatch = API_VERSIONS.find((v) => v.id === slugOrId);
    if (exactMatch) {
      return exactMatch.id;
    }
    // Check for slugified version match
    const slugMatch = API_VERSIONS.find(
      (v) => versionToSlug(v.id) === slugOrId,
    );
    if (slugMatch) {
      return slugMatch.id;
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
 * Convert a version ID to an Astro-compatible slug.
 * Astro removes dots from slugs, e.g., "v0.0.1-rc30" → "v001-rc30"
 */
export function versionToSlug(versionId: string): string {
  return versionId.replace(/\./g, '');
}

/**
 * Build a versioned API path using the slugified version.
 * e.g., ("v0.0.1-rc30", "exec") → "/api/v001-rc30/exec"
 */
export function buildVersionedPath(versionId: string, page: string): string {
  const slug = versionToSlug(versionId);
  const basePath = `/api/${slug}`;
  return page ? `${basePath}/${page}` : basePath;
}

/**
 * Rewrite an API URL to use a different version.
 * Preserves the page path and hash fragment.
 * e.g., ("/api/v001-rc30/exec#execute", "dev-latest") → "/api/dev-latest/exec#execute"
 */
export function rewriteApiUrl(url: string, targetVersionId: string): string {
  // Match /api/{version}/{page}#{hash} or /api/{version}/{page} or /api/{version}/
  const match = url.match(/^\/api\/[^/]+\/?(.*)$/);
  if (!match) return url;

  const pageAndHash = match[1]; // e.g., "exec#execute-command" or "exec" or ""
  const targetSlug = versionToSlug(targetVersionId);

  if (!pageAndHash) {
    return `/api/${targetSlug}/`;
  }
  return `/api/${targetSlug}/${pageAndHash}`;
}

// Re-export types for sidebar transformation (used by Sidebar.astro)
export interface SidebarLink {
  type: 'link';
  label: string;
  href: string;
  isCurrent: boolean;
  badge?: { text: string; variant: string };
  attrs?: Record<string, string>;
}

export interface SidebarGroup {
  type: 'group';
  label: string;
  entries: SidebarEntry[];
  collapsed: boolean;
  badge?: { text: string; variant: string };
}

export type SidebarEntry = SidebarLink | SidebarGroup;

/**
 * Recursively transform sidebar entries to use a specific API version.
 * Only affects links that start with /api/.
 */
export function transformSidebarForVersion(
  entries: SidebarEntry[],
  targetVersionId: string,
): SidebarEntry[] {
  return entries.map((entry): SidebarEntry => {
    if (entry.type === 'link') {
      // Only transform API links
      if (entry.href.startsWith('/api/')) {
        return {
          ...entry,
          href: rewriteApiUrl(entry.href, targetVersionId),
        };
      }
      return entry;
    }

    // It's a group - recurse into entries
    return {
      ...entry,
      entries: transformSidebarForVersion(entry.entries, targetVersionId),
    };
  });
}
