import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.sprites.dev',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport', // Prefetch links when they enter viewport
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto', // Inline small stylesheets
  },
  integrations: [
    starlight({
      title: 'Sprites',
      disable404Route: true,
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/superfly/sprites-docs',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/superfly/sprites-docs/edit/master/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', slug: 'index' },
            { label: 'Quickstart', slug: 'quickstart' },
            { label: 'Working with Sprites', slug: 'working-with-sprites' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Lifecycle', slug: 'concepts/lifecycle' },
            { label: 'Services', slug: 'concepts/services' },
            { label: 'Networking', slug: 'concepts/networking' },
            { label: 'Checkpoints', slug: 'concepts/checkpoints' },
          ],
        },
        {
          label: 'CLI',
          items: [
            { label: 'Installation', slug: 'cli/installation' },
            { label: 'Authentication', slug: 'cli/authentication' },
            { label: 'Commands', slug: 'cli/commands' },
          ],
        },
        {
          label: 'SDKs',
          items: [
            { label: 'JavaScript', slug: 'sdks/javascript' },
            { label: 'Go', slug: 'sdks/go' },
          ],
        },
        {
          label: 'API',
          items: [{ label: 'REST API', slug: 'api/rest' }],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Base Images', slug: 'reference/base-images' },
            { label: 'Configuration', slug: 'reference/configuration' },
            { label: 'Billing', slug: 'reference/billing' },
          ],
        },
      ],
      head: [
        // Google Search Console verification
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'OMPx4WGKmU7bVq2CxB97o4jZzhRULH3Dq1OJfA7UPTk',
          },
        },
        // OpenGraph / Social (og:image and twitter:image are set dynamically in Head.astro)
        {
          tag: 'meta',
          attrs: { property: 'og:type', content: 'website' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:site_name', content: 'Sprites Documentation' },
        },
        // Twitter Card
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
      ],
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Search: './src/components/Search.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        PageTitle: './src/components/PageTitle.astro',
        SiteTitle: './src/components/SiteTitle.astro',
      },
    }),
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
