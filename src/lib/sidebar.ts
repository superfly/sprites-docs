import { execSync } from 'node:child_process';
import path from 'node:path';
import type { StarlightUserConfig } from '@astrojs/starlight/types';
import { DEFAULT_VERSION } from './api-versions';

type SidebarConfig = NonNullable<StarlightUserConfig['sidebar']>;
type SidebarGroup = Extract<SidebarConfig[number], { items: unknown }>;

// API version to use in sidebar (uses default version)
const apiVersion = DEFAULT_VERSION.id;

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
    label: 'API Reference',
    items: [
      { label: 'Overview', slug: `api/${apiVersion}` },
      {
        label: 'Sprites',
        collapsed: false,
        items: [
          {
            label: 'Create Sprite',
            link: `/api/${apiVersion}/sprites#create-sprite`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
          {
            label: 'List Sprites',
            link: `/api/${apiVersion}/sprites#list-sprites`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Get Sprite',
            link: `/api/${apiVersion}/sprites#get-sprite`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Update Sprite',
            link: `/api/${apiVersion}/sprites#update-sprite`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-put',
            },
          },
          {
            label: 'Delete Sprite',
            link: `/api/${apiVersion}/sprites#delete-sprite`,
            badge: {
              text: '✕',
              variant: 'default' as const,
              class: 'sidebar-method-delete',
            },
          },
        ],
      },
      {
        label: 'Checkpoints',
        collapsed: false,
        items: [
          {
            label: 'Create Checkpoint',
            link: `/api/${apiVersion}/checkpoints#create-checkpoint`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
          {
            label: 'List Checkpoints',
            link: `/api/${apiVersion}/checkpoints#list-checkpoints`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Get Checkpoint',
            link: `/api/${apiVersion}/checkpoints#get-checkpoint`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Restore Checkpoint',
            link: `/api/${apiVersion}/checkpoints#restore-checkpoint`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
        ],
      },
      {
        label: 'Exec',
        collapsed: false,
        items: [
          {
            label: 'Execute Command',
            link: `/api/${apiVersion}/exec#execute-command`,
            badge: {
              text: '⚡',
              variant: 'default' as const,
              class: 'sidebar-method-wss',
            },
          },
          {
            label: 'List Exec Sessions',
            link: `/api/${apiVersion}/exec#list-exec-sessions`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Attach to Exec Session',
            link: `/api/${apiVersion}/exec#attach-to-exec-session`,
            badge: {
              text: '⚡',
              variant: 'default' as const,
              class: 'sidebar-method-wss',
            },
          },
          {
            label: 'Kill Exec Session',
            link: `/api/${apiVersion}/exec#kill-exec-session`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
        ],
      },
      {
        label: 'Policy',
        collapsed: false,
        items: [
          {
            label: 'Get Network Policy',
            link: `/api/${apiVersion}/policy#get-network-policy`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Set Network Policy',
            link: `/api/${apiVersion}/policy#set-network-policy`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
        ],
      },
      {
        label: 'HTTP Proxy',
        collapsed: false,
        items: [
          {
            label: 'TCP Proxy',
            link: `/api/${apiVersion}/proxy#tcp-proxy`,
            badge: {
              text: '⚡',
              variant: 'default' as const,
              class: 'sidebar-method-wss',
            },
          },
        ],
      },
      {
        label: 'Services',
        collapsed: false,
        items: [
          {
            label: 'List Services',
            link: `/api/${apiVersion}/services#list-services`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Get Service',
            link: `/api/${apiVersion}/services#get-service`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
          {
            label: 'Create Service',
            link: `/api/${apiVersion}/services#create-service`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-put',
            },
          },
          {
            label: 'Start Service',
            link: `/api/${apiVersion}/services#start-service`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
          {
            label: 'Stop Service',
            link: `/api/${apiVersion}/services#stop-service`,
            badge: {
              text: '↗',
              variant: 'default' as const,
              class: 'sidebar-method-post',
            },
          },
          {
            label: 'Get Service Logs',
            link: `/api/${apiVersion}/services#get-service-logs`,
            badge: {
              text: '↙',
              variant: 'default' as const,
              class: 'sidebar-method-get',
            },
          },
        ],
      },
      { label: 'Type Definitions', slug: `api/${apiVersion}/types` },
    ],
  },
];
