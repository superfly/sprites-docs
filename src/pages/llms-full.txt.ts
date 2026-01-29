import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { sidebarConfig } from '@/lib/sidebar';
import { cleanMdxContent } from '@/lib/utils';

export const prerender = true;

export type DocsGroup = {
  label: string;
  items: {
    slug: string;
    name: string;
    body: string;
    title: string;
    description?: string;
  }[];
};

export async function getGroupedDocs(): Promise<DocsGroup[]> {
  const collection = await getCollection('docs', ({ data }) => {
    return data.draft !== true;
  });

  const atlas = new Map<string, CollectionEntry<'docs'>>();
  for (const doc of collection) {
    atlas.set(doc.id, doc);
  }

  const groups = [];
  for (const { label, items: sidebarItems } of sidebarConfig) {
    const group = { label, items: [] };
    for (const sidebarItem of sidebarItems) {
      if (typeof sidebarItem === 'object' && sidebarItem != null) {
        if ('slug' in sidebarItem) {
          // Handle normal pages, which have a "slug" attribute
          tryPushDoc(group.items, sidebarItem.slug, sidebarItem.label);
          continue;
        } else if ('items' in sidebarItem && Array.isArray(sidebarItem.items)) {
          // Handle API pages, which have an "items" array
          if (sidebarItem.items.length > 0) {
            const item = sidebarItem.items[0];
            if (typeof item === 'object' && item != null && 'link' in item) {
              const hashIndex = item.link.lastIndexOf('#');
              if (hashIndex !== -1) {
                // Remove the leading slash and the URL hash
                tryPushDoc(
                  group.items,
                  item.link.slice(1, hashIndex),
                  sidebarItem.label,
                );
                continue;
              }
            }
          }
        }
        console.warn(
          `Warning: Failed to identify sidebar style of ${sidebarItem.label}:`,
        );
      }
    }
    groups.push(group);
  }

  return groups;

  function tryPushDoc(items: DocsGroup['items'], slug: string, name?: string) {
    const doc = atlas.get(slug);
    if (doc != null && doc.body != null) {
      items.push({
        slug: doc.id,
        name: name ?? doc.data.title,
        body: doc.body,
        title: doc.data.title,
        description: doc.data.description,
      });
    } else {
      console.warn(`Warning: Could not find ${slug}:`);
    }
  }
}

export const GET: APIRoute = async () => {
  const parts: string[] = [];

  // Header
  parts.push(`# Sprites Documentation (Full Content)

> This file contains the complete documentation for Sprites, a product by Fly.io that provides persistent, hardware-isolated execution environments for arbitrary code.

Generated: ${new Date().toISOString().split('T')[0]}
Source: https://docs.sprites.dev/
Summary: https://docs.sprites.dev/llms.txt

---
`);

  const groups = await getGroupedDocs();
  for (const { label, items } of groups) {
    parts.push(`\n# ${label}\n`);
    for (const { slug, title, description, body } of items) {
      const cleanedContent = cleanMdxContent(body);

      // Add document with title and URL
      parts.push(`## ${title}

URL: https://docs.sprites.dev/${slug}.md
${description ? `\n${description}\n` : ''}
${cleanedContent}

---
`);
    }
  }

  const fullContent = parts.join('\n');

  return new Response(fullContent);
};
