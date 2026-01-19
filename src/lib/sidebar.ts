import { execSync } from 'node:child_process';
import path from 'node:path';
import type { StarlightUserConfig } from '@astrojs/starlight/types';
import { DEFAULT_VERSION, versionToSlug } from './api-versions';

type SidebarConfig = NonNullable<StarlightUserConfig['sidebar']>;
type SidebarGroup = Extract<SidebarConfig[number], { items: unknown }>;

// API version slug to use in sidebar (slugified for Astro routing)
const apiVersion = versionToSlug(DEFAULT_VERSION.id);

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
    label: 'CLI Reference',
    items: [
      { label: 'Installation', slug: 'cli/installation' },
      { label: 'Authentication', slug: 'cli/authentication' },
      { label: 'Commands', slug: 'cli/commands' },
    ],
  },
  {
    label: 'API Reference',
    items: [
      { label: 'Overview', link: `/api/${apiVersion}/` },
      {
        label: 'Sprites',
        collapsed: true,
        items: [
          {
            label: 'Create Sprite',
            link: `/api/${apiVersion}/sprites#create-sprite`,
            attrs: { 'data-method': 'post' },
          },
          {
            label: 'List Sprites',
            link: `/api/${apiVersion}/sprites#list-sprites`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Get Sprite',
            link: `/api/${apiVersion}/sprites#get-sprite`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Update Sprite',
            link: `/api/${apiVersion}/sprites#update-sprite`,
            attrs: { 'data-method': 'put' },
          },
          {
            label: 'Delete Sprite',
            link: `/api/${apiVersion}/sprites#delete-sprite`,
            attrs: { 'data-method': 'delete' },
          },
        ],
      },
      {
        label: 'Checkpoints',
        collapsed: true,
        items: [
          {
            label: 'Create Checkpoint',
            link: `/api/${apiVersion}/checkpoints#create-checkpoint`,
            attrs: { 'data-method': 'post' },
          },
          {
            label: 'List Checkpoints',
            link: `/api/${apiVersion}/checkpoints#list-checkpoints`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Get Checkpoint',
            link: `/api/${apiVersion}/checkpoints#get-checkpoint`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Restore Checkpoint',
            link: `/api/${apiVersion}/checkpoints#restore-checkpoint`,
            attrs: { 'data-method': 'post' },
          },
        ],
      },
      {
        label: 'Exec',
        collapsed: true,
        items: [
          {
            label: 'Execute Command',
            link: `/api/${apiVersion}/exec#execute-command`,
            attrs: { 'data-method': 'wss' },
          },
          {
            label: 'List Exec Sessions',
            link: `/api/${apiVersion}/exec#list-exec-sessions`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Attach to Exec Session',
            link: `/api/${apiVersion}/exec#attach-to-exec-session`,
            attrs: { 'data-method': 'wss' },
          },
          {
            label: 'Kill Exec Session',
            link: `/api/${apiVersion}/exec#kill-exec-session`,
            attrs: { 'data-method': 'post' },
          },
        ],
      },
      {
        label: 'Network Policy',
        collapsed: true,
        items: [
          {
            label: 'Get Network Policy',
            link: `/api/${apiVersion}/policy#get-network-policy`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Set Network Policy',
            link: `/api/${apiVersion}/policy#set-network-policy`,
            attrs: { 'data-method': 'post' },
          },
        ],
      },
      {
        label: 'Proxy',
        collapsed: true,
        items: [
          {
            label: 'TCP Proxy',
            link: `/api/${apiVersion}/proxy#tcp-proxy`,
            attrs: { 'data-method': 'wss' },
          },
        ],
      },
      {
        label: 'Services',
        collapsed: true,
        items: [
          {
            label: 'List Services',
            link: `/api/${apiVersion}/services#list-services`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Get Service',
            link: `/api/${apiVersion}/services#get-service`,
            attrs: { 'data-method': 'get' },
          },
          {
            label: 'Create Service',
            link: `/api/${apiVersion}/services#create-service`,
            attrs: { 'data-method': 'put' },
          },
          {
            label: 'Start Service',
            link: `/api/${apiVersion}/services#start-service`,
            attrs: { 'data-method': 'post' },
          },
          {
            label: 'Stop Service',
            link: `/api/${apiVersion}/services#stop-service`,
            attrs: { 'data-method': 'post' },
          },
          {
            label: 'Get Service Logs',
            link: `/api/${apiVersion}/services#get-service-logs`,
            attrs: { 'data-method': 'get' },
          },
        ],
      },
      { label: 'Type Definitions', link: `/api/${apiVersion}/types` },
    ],
  },
];
