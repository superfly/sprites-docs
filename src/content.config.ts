import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Date a page was first published or republished. The sidebar "New"
        // badge prefers this over git history, so a rewritten older page can
        // be re-flagged as new. See src/lib/sidebar.ts.
        publishedDate: z.coerce.date().optional(),
      }),
    }),
  }),
};
