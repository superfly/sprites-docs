# Sprite Environment

Sprite is a containerized development environment designed for coding agents.

## Why Sprites

**Discoverable** — Agents read `/.sprite/llm.txt` and `/.sprite/docs/` to understand the environment, available tools, and how to use them. No manual context injection needed.

**Checkpoint/Restore** — Agents can snapshot state with `sprite-env checkpoints create` and roll back with `restore`. Enables experimentation without risk.

**Network Control** — DNS-based egress filtering. Lock down to specific domains or allow everything. Agents can't exfiltrate data unless policy permits.

**HTTP Access** — Services are instantly available on the internet via the sprite's URL. Agents can deploy and test web apps without infrastructure setup.

## CLIs

| CLI | Where | Purpose |
|-----|-------|---------|
| `sprite` | Your local machine | Create, delete, configure sprites, manage URL settings, network policy |
| `sprite-env` | Inside sprite | Manage services and checkpoints within this environment |

## Key Concepts

- **Services** — Long-running processes that persist across sessions and auto-restart at boot
- **Checkpoints** — Point-in-time filesystem snapshots with copy-on-write storage
- **Network Policy** — DNS-based egress filtering (managed externally via `sprite` CLI)
- **Languages** — 10 runtimes with version managers (Node.js, Python, Ruby, Rust, Go, Erlang, Elixir, Java, Bun, Deno)

## Quick Start (inside sprite)

```bash
# Check version
sprite-env version

# Create a service
sprite-env services create myapp \
  --cmd node --args server.js --http-port 3000

# Create a checkpoint
sprite-env checkpoints create

# List services
sprite-env services list
```

## Environment

| Property | Value |
|----------|-------|
| User | `sprite` (passwordless sudo) |
| Base | Ubuntu (no systemd) |
| Filesystem | Copy-on-write overlay |
| HTTP Proxy | Routes to port 8080 by default |
| API Socket | `/.sprite/api.sock` |
