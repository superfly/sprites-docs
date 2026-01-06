# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sprites documentation site built with Astro Starlight and React components. Static site deployed to Fly.io via Docker/nginx.

## Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start dev server at localhost:4321
pnpm build           # Build static site to ./dist/
pnpm preview         # Preview production build locally
pnpm lint            # Run Biome linter
pnpm lint:fix        # Auto-fix lint issues
pnpm test:e2e        # Run Cypress e2e tests (starts preview server automatically)
pnpm test:e2e:open   # Open Cypress GUI for interactive testing
```

## Architecture

### Tech Stack
- **Framework**: Astro 5 with Starlight documentation theme
- **Styling**: Tailwind CSS v4 with shadcn/ui components (OKLCH color space)
- **Interactive**: React 19 islands with Radix UI primitives
- **Fonts**: Self-hosted Inter (body), JetBrains Mono (headings/code), Fricolage Grotesque (brand)

### Project Structure
- `src/content/docs/` - MDX documentation pages (routes based on filename)
- `src/components/react/` - React island components for interactive elements
- `src/components/ui/` - shadcn/ui base components (Radix-based)
- `src/components/*.astro` - Astro wrapper components for React islands and Starlight overrides
- `src/styles/custom.css` - Theme customization (Starlight + shadcn variables)
- `src/plugins/` - Rehype/remark plugins (e.g., `rehype-shadcn-table.ts` for table styling)
- `astro.config.ts` - Site config including sidebar structure
- `cypress/e2e/` - E2E tests organized by `smoke/` (basic) and `features/` (specific)

### Component Pattern
React components are wrapped in `.astro` files for MDX usage. All React components export from `src/components/react/index.ts`. Use `client:load` directive when importing React components in MDX.

### Starlight Overrides
Custom Starlight components in `src/components/` override defaults: `Head.astro`, `Header.astro`, `Search.astro`, `ThemeSelect.astro`, `ThemeProvider.astro`, `PageTitle.astro`, `SiteTitle.astro`, `Pagination.astro`.

### Path Aliases
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`

## Styling Notes

- Theme uses rounded corners (`--radius: 0.5rem`)
- Dark mode is default; light mode uses violet accent (hue 285), dark uses teal/green (hue ~145)
- Tailwind v4 custom variant: `@custom-variant dark (&:is(.dark *, [data-theme="dark"] *))`
- Tables are auto-styled via rehype plugin with `data-slot` attributes for CSS targeting
