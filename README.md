# Fly.io Sprites docs

Source for the Sprites documentation published at https://docs.fly.io/sprites

This repository is one of the sources behind `docs.fly.io`. The rest of the site
is built from [superfly/docs](https://github.com/superfly/docs).

## The format changed on 23 September 2026

These docs moved from Astro and Starlight to Mintlify. If you have a branch, a
fork or an open pull request from before that date, it targets a tree that no
longer exists here.

What changed:

- Pages are Mintlify MDX at the repository root, not Starlight MDX under
  `src/content/docs/`. `quickstart.mdx` is now the top level file it looks like.
- Navigation lives in `docs.json` rather than `src/lib/sidebar.ts`.
- Mintlify's components are built in, so pages should not import
  `{ Callout, LinkCard, CardGrid }` from `@/components/react`. That import
  breaks the build.
- There is no Astro project. `astro.config.mjs`, the React components and the
  npm build are gone.

Rewriting a page as Mintlify MDX is usually quicker than rebasing. Find the
equivalent `.mdx` file, apply your change there, and open a fresh pull request.
If yours was closed during the migration, the diff is still on it.

## Where things live

| | |
| --- | --- |
| Pages | `.mdx` files at the root and under `concepts/`, `integrations/`, `cli/` |
| Navigation | `docs.json` |
| Shared snippets | `snippets/` |
| Images | `images/` |
| Prose linting | `.vale.ini` |

The API reference is generated from the published OpenAPI document rather than
from files here.

## The old site

`docs.sprites.dev` served this content before the move. The Astro source remains
in this repository's history.
