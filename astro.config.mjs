// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

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
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/superfly/sprites-docs' },
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
          items: [
            { label: 'REST API', slug: 'api/rest' },
          ],
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
      head: [], // Fonts are now self-hosted via fontsource
      components: {
        Header: './src/components/Header.astro',
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
