import { execSync } from 'node:child_process';
import path from 'node:path';
import type { StarlightUserConfig } from '@astrojs/starlight/types';

type SidebarConfig = NonNullable<StarlightUserConfig['sidebar']>;
type SidebarGroup = Extract<SidebarConfig[number], { items: unknown }>;

interface SidebarBadge {
  text: string;
  variant: 'note' | 'tip' | 'caution' | 'danger' | 'success' | 'default';
  class?: string;
}

// Configuration for badge thresholds
const BADGE_CONFIG = {
  // Show "New" badge for content published within this many days
  newThresholdDays: 3,
  // Show "Updated" badge for content updated within this many days
  updatedThresholdDays: 0,
};

/**
 * Get the first commit date (publish date) for a file
 */
function getPublishDate(filePath: string): Date | null {
  try {
    const result = execSync(
      `git log --follow --format=%aI --diff-filter=A -- "${filePath}" | tail -1`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();

    if (!result) {
      // Fallback: get the oldest commit that touched this file
      const fallback = execSync(
        `git log --follow --format=%aI -- "${filePath}" | tail -1`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      ).trim();
      return fallback ? new Date(fallback) : null;
    }

    return new Date(result);
  } catch {
    return null;
  }
}

/**
 * Get the last commit date (update date) for a file
 */
function getLastUpdatedDate(filePath: string): Date | null {
  try {
    const result = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return result ? new Date(result) : null;
  } catch {
    return null;
  }
}

/**
 * Compute the appropriate badge for a doc based on its git history
 */
function computeBadge(slug: string): SidebarBadge | undefined {
  const docsDir = path.resolve(process.cwd(), 'src/content/docs');
  // Handle index page
  const fileName = slug === 'index' ? 'index.mdx' : `${slug}.mdx`;
  const filePath = path.join(docsDir, fileName);

  const now = new Date();
  const publishDate = getPublishDate(filePath);
  const lastUpdated = getLastUpdatedDate(filePath);

  if (!publishDate || !lastUpdated) {
    return undefined;
  }

  const daysSincePublish = Math.floor(
    (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysSinceUpdate = Math.floor(
    (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
  );

  // "New" takes priority - show for recently published content
  if (daysSincePublish <= BADGE_CONFIG.newThresholdDays) {
    return {
      text: 'New',
      variant: 'success',
      class: 'sidebar-badge-new',
    };
  }

  // "Updated" for content that was recently modified (but not new)
  if (
    BADGE_CONFIG.updatedThresholdDays > 0 &&
    daysSinceUpdate < BADGE_CONFIG.updatedThresholdDays
  ) {
    return {
      text: 'Updated',
      variant: 'note',
      class: 'sidebar-badge-updated',
    };
  }

  return undefined;
}

/**
 * Add badges to sidebar items based on git history
 */
function addBadgesToItems(items: SidebarGroup['items']): SidebarGroup['items'] {
  return items.map((item) => {
    // Only compute badges for internal docs (items with slug, not external links)
    if (typeof item === 'object' && 'slug' in item && item.slug) {
      const badge = computeBadge(item.slug);
      if (badge) {
        return { ...item, badge };
      }
    }
    return item;
  });
}

/**
 * Process sidebar configuration and add badges based on git dates
 */
export function withBadges(sidebar: SidebarGroup[]): SidebarConfig {
  return sidebar.map((group) => ({
    ...group,
    items: addBadgesToItems(group.items),
  }));
}

/**
 * The base sidebar configuration without badges
 */
export const sidebarConfig: SidebarGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Overview', slug: 'index' },
      { label: 'Quickstart', slug: 'quickstart' },
      { label: 'Working with Sprites', slug: 'working-with-sprites' },
    ],
  },
  {
    label: 'Concepts',
    items: [
      { label: 'Lifecycle', slug: 'concepts/lifecycle' },
      { label: 'Services', slug: 'concepts/services' },
      { label: 'Networking', slug: 'concepts/networking' },
      { label: 'Checkpoints', slug: 'concepts/checkpoints' },
    ],
  },
  {
    label: 'CLI',
    items: [
      { label: 'Installation', slug: 'cli/installation' },
      { label: 'Authentication', slug: 'cli/authentication' },
      { label: 'Commands', slug: 'cli/commands' },
    ],
  },
  {
    label: 'SDKs',
    items: [
      { label: 'JavaScript', slug: 'sdks/javascript' },
      { label: 'Go', slug: 'sdks/go' },
      { label: 'Elixir', slug: 'sdks/elixir' },
    ],
  },
  {
    label: 'API',
    items: [{ label: 'Sprites API v1', link: 'https://sprites.dev/api' }],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Base Images', slug: 'reference/base-images' },
      { label: 'Configuration', slug: 'reference/configuration' },
      { label: 'Billing', slug: 'reference/billing' },
    ],
  },
];
