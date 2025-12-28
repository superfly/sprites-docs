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
```

## Architecture

### Tech Stack
- **Framework**: Astro 5 with Starlight documentation theme
- **Styling**: Tailwind CSS v4 with shadcn/ui components (OKLCH color space)
- **Interactive**: React 19 islands with Radix UI primitives
- **Fonts**: Self-hosted Inter (body) and JetBrains Mono (headings/code)

### Project Structure
- `src/content/docs/` - MDX documentation pages (routes based on filename)
- `src/components/react/` - React island components for interactive elements
- `src/components/ui/` - shadcn/ui base components (Radix-based)
- `src/components/*.astro` - Astro wrapper components for React islands
- `src/styles/custom.css` - Theme customization (Starlight + shadcn variables)
- `astro.config.mjs` - Site config including sidebar structure

### Component Pattern
React components are wrapped in `.astro` files for MDX usage. All React components export from `src/components/react/index.ts`. Use `client:load` directive when importing React components in MDX.

### Starlight Overrides
Custom Starlight components in `src/components/` override defaults: `Head.astro`, `Header.astro`, `Search.astro`, `ThemeSelect.astro`, `PageTitle.astro`, `SiteTitle.astro`.

### Path Aliases
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`

## Styling Notes

- Theme uses sharp corners (`--radius: 0`, `--sl-border-radius: 0`)
- Dark mode is default; light mode uses violet accent (hue 285), dark uses teal/green (hue ~131)
- Tailwind v4 custom variant: `@custom-variant dark (&:is(.dark *, [data-theme="dark"] *))`
