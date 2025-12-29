import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs');
  return docs.map((doc) => ({
    params: { slug: doc.id === 'index' ? undefined : doc.id },
    props: { doc },
  }));
};

function cleanMdxContent(content: string): string {
  // Remove MDX import statements at the start of the file
  content = content.replace(
    /^(\s*import\s+.*?(?:from\s+['"].*?['"])?;?\s*\n)+/m,
    '',
  );

  // Process Tabs components - extract TabItem contents
  content = content.replace(/<Tabs>[\s\S]*?<\/Tabs>/g, (match) => {
    const results: string[] = [];
    const tabItemRegex =
      /<TabItem[^>]*label="([^"]*)"[^>]*>([\s\S]*?)(?=<TabItem|<\/Tabs>)/g;

    for (const [, label, tabContent] of match.matchAll(tabItemRegex)) {
      const cleanContent = tabContent.replace(/<\/TabItem>\s*$/, '').trim();
      if (cleanContent) {
        results.push(`**${label}:**\n${cleanContent}`);
      }
    }

    return results.length > 0 ? results.join('\n\n') : '';
  });

  // Remove self-closing JSX/MDX components
  content = content.replace(/<[A-Z][a-zA-Z]*\s+[^>]*\/>/g, '');

  // Handle Callout components - keep content
  content = content.replace(
    /<Callout[^>]*>([\s\S]*?)<\/Callout>/g,
    (_, inner) => inner.trim(),
  );

  // Remove remaining JSX component tags
  content = content.replace(/<[A-Z][a-zA-Z]*[^>]*>/g, '');
  content = content.replace(/<\/[A-Z][a-zA-Z]*>/g, '');

  // Convert relative links to fully qualified URLs
  content = content.replace(
    /\[([^\]]+)\]\(\/([^)]*)\)/g,
    (_, text, path) => `[${text}](https://docs.sprites.dev/${path})`,
  );

  // Clean up excessive blank lines
  content = content.replace(/\n{4,}/g, '\n\n\n');

  return content.trim();
}

export const GET: APIRoute = async ({ props }) => {
  const { doc } = props as {
    doc: {
      data: { title: string; description?: string };
      body: string;
      id: string;
    };
  };

  const url = `https://docs.sprites.dev/${doc.id === 'index' ? '' : `${doc.id}/`}`;
  const cleanedContent = cleanMdxContent(doc.body);

  const markdown = `# ${doc.data.title}

Source: ${url}
${doc.data.description ? `\n${doc.data.description}\n` : ''}
${cleanedContent}
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
