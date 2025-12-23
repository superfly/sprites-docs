# Bun & Deno

Direct installs (no version manager).

## Bun

**Location:** `/.sprite/languages/bun`

```bash
bun --version
bun init
bun install
bun add express
bun run app.ts
bunx cowsay hello
```

### HTTP Server

```typescript
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello");
  },
});
```

## Deno

**Location:** `/.sprite/languages/deno`

```bash
deno --version
deno init
deno run --allow-net server.ts
deno task dev
```

### Permissions

| Flag | Access |
|------|--------|
| `--allow-net` | Network |
| `--allow-read` | Filesystem read |
| `--allow-write` | Filesystem write |
| `--allow-env` | Environment vars |
| `-A` | All |

### HTTP Server

```typescript
Deno.serve({ port: 8000 }, () => new Response("Hello"));
```
