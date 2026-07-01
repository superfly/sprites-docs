/**
 * Rehype plugin to mark external links in markdown/MDX content.
 *
 * External links (absolute http(s) URLs pointing to a different host than the
 * docs site) are opened in a new tab and get a small "arrow up-right" icon
 * appended, matching the lucide ArrowUpRight icon used elsewhere in the site.
 *
 * Internal links (relative paths, in-page anchors, same-host absolute URLs,
 * mailto/tel, etc.) are left untouched.
 */
import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

// Host of the docs site; absolute links to this host are treated as internal.
const SITE_HOST = 'docs.sprites.dev';

function isExternalHref(href: string): boolean {
  // Protocol-relative URLs, e.g. //example.com/foo
  if (href.startsWith('//')) {
    const host = href.slice(2).split('/')[0].toLowerCase();
    return host !== SITE_HOST;
  }

  // Absolute http(s) URLs
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).host.toLowerCase() !== SITE_HOST;
    } catch {
      return false;
    }
  }

  // Everything else (relative, anchors, mailto:, tel:, …) is internal.
  return false;
}

// lucide "arrow-up-right" icon as a hast element (inherits currentColor).
function externalIcon(): Element {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: ['external-icon'],
      'aria-hidden': 'true',
      focusable: 'false',
      xmlns: 'http://www.w3.org/2000/svg',
      width: 16,
      height: 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    children: [
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M7 7h10v10' },
        children: [],
      },
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M7 17 17 7' },
        children: [],
      },
    ],
  };
}

export default function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;

      const href = node.properties?.href;
      if (typeof href !== 'string' || !isExternalHref(href)) return;

      // Guard against double-processing.
      if (node.properties['data-external']) return;

      node.properties = {
        ...node.properties,
        'data-external': true,
        target: '_blank',
        rel: 'noopener noreferrer',
      };

      node.children.push(externalIcon());
    });
  };
}
