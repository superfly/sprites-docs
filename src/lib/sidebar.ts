import { execSync } from 'node:child_process';
import path from 'node:path';
import type { StarlightUserConfig } from '@astrojs/starlight/types';
import { apiSidebarConfig } from './api-sidebar';

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

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getGitDate(filePath: string, mode: 'first' | 'last'): Date | null {
  try {
    const flags = mode === 'first' ? '--follow --diff-filter=A' : '-1';
    const result = execSync(
      `git log ${flags} --format=%aI -- "${filePath}" | tail -1`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    ).trim();
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
  const fileName = slug === 'index' ? 'index.mdx' : `${slug}.mdx`;
  const filePath = path.join(docsDir, fileName);

  const publishDate = getGitDate(filePath, 'first');
  if (!publishDate) return undefined;

  // "New" takes priority
  if (daysSince(publishDate) <= BADGE_CONFIG.newThresholdDays) {
    return { text: 'New', variant: 'success', class: 'sidebar-badge-new' };
  }

  // "Updated" - only check if enabled
  if (BADGE_CONFIG.updatedThresholdDays > 0) {
    const lastUpdated = getGitDate(filePath, 'last');
    if (
      lastUpdated &&
      daysSince(lastUpdated) < BADGE_CONFIG.updatedThresholdDays
    ) {
      return {
        text: 'Updated',
        variant: 'note',
        class: 'sidebar-badge-updated',
      };
    }
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
 * The base sidebar configuration without badges.
 * API Reference section is dynamically generated from the API schema.
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
    label: 'CLI Reference',
    items: [
      { label: 'Installation', slug: 'cli/installation' },
      { label: 'Authentication', slug: 'cli/authentication' },
      { label: 'Commands', slug: 'cli/commands' },
    ],
  },
  {
    label: 'API Reference',
    // Items are auto-generated from API schema by scripts/generate-api-docs.ts
    // Links are dynamically rewritten by Sidebar.astro based on current URL version
    items: apiSidebarConfig,
  },
];
