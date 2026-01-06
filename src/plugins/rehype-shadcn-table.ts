/**
 * Rehype plugin to transform HTML tables to use shadcn/ui Table styling.
 * Adds data-slot attributes for CSS styling and wraps tables in a scrollable container.
 */
import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

export default function rehypeShadcnTable() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table') {
        node.properties = node.properties || {};
        node.properties['data-slot'] = 'table';

        // Wrap table in a container div for horizontal scrolling
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { 'data-slot': 'table-container' },
          children: [node],
        };

        // Replace table with wrapper in parent
        if (parent && typeof index === 'number') {
          (parent.children as Element[])[index] = wrapper;
        }
      }

      if (node.tagName === 'thead') {
        node.properties = node.properties || {};
        node.properties['data-slot'] = 'table-header';
      }

      if (node.tagName === 'tbody') {
        node.properties = node.properties || {};
        node.properties['data-slot'] = 'table-body';
      }

      if (node.tagName === 'tr') {
        node.properties = node.properties || {};
        node.properties['data-slot'] = 'table-row';
      }

      if (node.tagName === 'th') {
        node.properties = node.properties || {};
        node.properties['data-slot'] = 'table-head';
      }

      if (node.tagName === 'td') {
        node.properties = node.properties || {};
        node.properties['data-slot'] = 'table-cell';
      }
    });
  };
}
