/**
 * Rehype plugin to transform HTML tables to use shadcn/ui Table styling.
 * Adds data-slot attributes for CSS styling and wraps tables in a scrollable container.
 */
import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

const TAG_TO_SLOT: Record<string, string> = {
  table: 'table',
  thead: 'table-header',
  tbody: 'table-body',
  tr: 'table-row',
  th: 'table-head',
  td: 'table-cell',
};

export default function rehypeShadcnTable() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      const slot = TAG_TO_SLOT[node.tagName];
      if (!slot) return;

      node.properties = { ...node.properties, 'data-slot': slot };

      // Wrap table in a container div for horizontal scrolling
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { 'data-slot': 'table-container' },
          children: [node],
        };
        (parent.children as Element[])[index] = wrapper;
      }
    });
  };
}
