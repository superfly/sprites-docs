import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

import { cleanMdxContent } from '@/lib/utils';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs', ({ data }) => {
    return data.draft !== true;
  });
  return docs.map((doc) => ({
    params: { slug: doc.id },
    props: { doc },
  }));
};

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

  return new Response(markdown);
};
