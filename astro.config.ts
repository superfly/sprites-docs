import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { sidebarConfig, withBadges } from './src/lib/sidebar';
import rehypeShadcnTable from './src/plugins/rehype-shadcn-table';

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
      expressiveCode: {
        shiki: {
          langs: [
            {
              name: 'output',
              scopeName: 'text.output',
              patterns: [],
            },
          ],
        },
      },
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
      // editLink: {
      //   baseUrl: 'https://github.com/superfly/sprites-docs/edit/main/',
      // },
      sidebar: withBadges(sidebarConfig),
      head: [
        // Upgrade HTTP requests to HTTPS (workaround for Astro prefetch bug #13570)
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: 'upgrade-insecure-requests',
          },
        },
        // Favicons for Google Search and browsers
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/png',
            sizes: '96x96',
            href: '/favicon-96x96.png',
          },
        },
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/apple-touch-icon.png',
          },
        },
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: '/site.webmanifest' },
        },
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
        Sidebar: './src/components/Sidebar.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        ThemeProvider: './src/components/ThemeProvider.astro',
        PageTitle: './src/components/PageTitle.astro',
        SiteTitle: './src/components/SiteTitle.astro',
        Pagination: './src/components/Pagination.astro',
      },
    }),
    react(),
    sitemap(),
  ],
  markdown: {
    rehypePlugins: [rehypeShadcnTable],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
