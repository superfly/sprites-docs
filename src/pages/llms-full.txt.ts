import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { APIRoute } from 'astro';

export const prerender = true;

// Use process.cwd() which is the project root during Astro build
const docsDir = join(process.cwd(), 'src/content/docs');

// Document order matching the sidebar structure
const docOrder = [
  // Getting Started
  'index.mdx',
  'quickstart.mdx',
  'working-with-sprites.mdx',
  // Concepts
  'concepts/lifecycle.mdx',
  'concepts/services.mdx',
  'concepts/networking.mdx',
  'concepts/checkpoints.mdx',
  // CLI
  'cli/installation.mdx',
  'cli/authentication.mdx',
  'cli/commands.mdx',
  // SDKs
  'sdks/javascript.mdx',
  'sdks/go.mdx',
  // API (generated)
  'api/index.mdx',
  'api/exec.mdx',
  'api/checkpoints.mdx',
  'api/services.mdx',
  'api/proxy.mdx',
  'api/policy.mdx',
  'api/types.mdx',
  // Reference
  'reference/base-images.mdx',
  'reference/configuration.mdx',
  'reference/billing.mdx',
];

// Section headers for organization
const sections: Record<string, string> = {
  'index.mdx': '# Getting Started',
  'concepts/lifecycle.mdx': '# Concepts',
  'cli/installation.mdx': '# CLI',
  'sdks/javascript.mdx': '# SDKs',
  'api/index.mdx': '# API',
  'reference/base-images.mdx': '# Reference',
};

interface DocMeta {
  title: string;
  description?: string;
}

function extractFrontmatter(content: string): { meta: DocMeta; body: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { meta: { title: 'Untitled' }, body: content };
  }

  const [, frontmatterStr, body] = frontmatterMatch;
  const meta: DocMeta = { title: 'Untitled' };

  // Parse YAML-like frontmatter (simple key: value parsing)
  for (const line of frontmatterStr.split('\n')) {
    const titleMatch = line.match(/^title:\s*(.+)$/);
    if (titleMatch) {
      meta.title = titleMatch[1].replace(/^["']|["']$/g, '');
    }
    const descMatch = line.match(/^description:\s*(.+)$/);
    if (descMatch) {
      meta.description = descMatch[1].replace(/^["']|["']$/g, '');
    }
  }

  return { meta, body };
}

function cleanMdxContent(content: string): string {
  // Remove MDX import statements at the start of the file (before any content)
  // This preserves imports inside code blocks
  content = content.replace(
    /^(\s*import\s+.*?(?:from\s+['"].*?['"])?;?\s*\n)+/m,
    '',
  );

  // Process Tabs components - extract TabItem contents
  // Need to handle nested content carefully (code blocks with special chars)
  content = content.replace(/<Tabs>[\s\S]*?<\/Tabs>/g, (match) => {
    const results: string[] = [];

    // Split by TabItem boundaries and extract content
    const tabItemRegex =
      /<TabItem[^>]*label="([^"]*)"[^>]*>([\s\S]*?)(?=<TabItem|<\/Tabs>)/g;

    for (const [, label, tabContent] of match.matchAll(tabItemRegex)) {
      // Clean up the content - remove closing </TabItem> if present
      const cleanContent = tabContent.replace(/<\/TabItem>\s*$/, '').trim();
      if (cleanContent) {
        results.push(`**${label}:**\n${cleanContent}`);
      }
    }

    return results.length > 0 ? results.join('\n\n') : '';
  });

  // Remove self-closing JSX/MDX components (like <Callout ... />)
  content = content.replace(/<[A-Z][a-zA-Z]*\s+[^>]*\/>/g, '');

  // Remove JSX components with content (non-greedy, for simple components)
  // Handle Callout, Snippet, and other simple wrapper components
  content = content.replace(
    /<Callout[^>]*>([\s\S]*?)<\/Callout>/g,
    (_, inner) => {
      // Keep the content, just remove the wrapper
      return inner.trim();
    },
  );

  // Remove remaining JSX component tags (opening and closing)
  content = content.replace(/<[A-Z][a-zA-Z]*[^>]*>/g, '');
  content = content.replace(/<\/[A-Z][a-zA-Z]*>/g, '');

  // Convert relative links to fully qualified URLs
  // Matches markdown links like [text](/path) or [text](/path/)
  content = content.replace(
    /\[([^\]]+)\]\(\/([^)]*)\)/g,
    (_, text, path) => `[${text}](https://docs.sprites.dev/${path})`,
  );

  // Clean up excessive blank lines
  content = content.replace(/\n{4,}/g, '\n\n\n');

  // Trim leading/trailing whitespace
  content = content.trim();

  return content;
}

function slugToUrl(slug: string): string {
  const path = slug.replace(/\.mdx$/, '').replace(/^index$/, '');
  return `https://docs.sprites.dev/${path}${path ? '/' : ''}`;
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

  let currentSection = '';

  for (const docPath of docOrder) {
    const fullPath = join(docsDir, docPath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const { meta, body } = extractFrontmatter(content);
      const cleanedContent = cleanMdxContent(body);

      // Add section header if we're entering a new section
      if (sections[docPath] && sections[docPath] !== currentSection) {
        currentSection = sections[docPath];
        parts.push(`\n${currentSection}\n`);
      }

      // Add document with title and URL
      const url = slugToUrl(docPath);
      parts.push(`## ${meta.title}

URL: ${url}
${meta.description ? `\n${meta.description}\n` : ''}
${cleanedContent}

---
`);
    } catch (error) {
      console.warn(`Warning: Could not read ${docPath}:`, error);
    }
  }

  const fullContent = parts.join('\n');

  return new Response(fullContent);
};
