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
    const items = [];
    for (const sidebarItem of sidebarItems) {
      if (
        typeof sidebarItem === 'object' &&
        sidebarItem != null &&
        'slug' in sidebarItem
      ) {
        const doc = atlas.get(sidebarItem.slug);
        if (doc != null && doc.body != null) {
          items.push({
            slug: doc.id,
            body: doc.body,
            title: doc.data.title,
            description: doc.data.description,
          });
        } else {
          console.warn(`Warning: Could not find ${sidebarItem.label}:`);
        }
      }
    }
    groups.push({ label, items });
  }

  return groups;
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
