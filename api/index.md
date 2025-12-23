# REST API

## Two APIs

| API | Access | Purpose |
|-----|--------|---------|
| **External API** | `api.sprites.dev` | Full sprite management (create, delete, settings, network policy, checkpoints) |
| **Internal API** | `/.sprite/api.sock` | Services and checkpoints only (from inside the sprite) |

---

## External API

Base URL: `https://api.sprites.dev/v1`

Authentication: `Authorization: Bearer <token>`

Used by the `sprite` CLI on your local machine.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sprites` | [Create sprite](/api/sprites#create) |
| GET | `/sprites` | [List sprites](/api/sprites#list) |
| GET | `/sprites/{name}` | [Get sprite](/api/sprites#get) |
| PUT | `/sprites/{name}` | [Update URL settings](/api/sprites#update) |
| DELETE | `/sprites/{name}` | [Delete sprite](/api/sprites#delete) |
| POST | `/sprites/{name}/upgrade` | [Upgrade sprite](/api/sprites#upgrade) |
| PUT | `/sprites/{name}/policy/network` | Update network policy |
| POST | `/sprites/{name}/checkpoint` | [Create checkpoint](/api/checkpoints#create) |
| GET | `/sprites/{name}/checkpoints` | [List checkpoints](/api/checkpoints#list) |
| GET | `/sprites/{name}/checkpoints/{id}` | [Get checkpoint](/api/checkpoints#get) |
| POST | `/sprites/{name}/checkpoints/{id}/restore` | [Restore checkpoint](/api/checkpoints#restore) |
| POST | `/sprites/{name}/exec` | [Execute command](/api/exec) |

---

## Internal API

Socket: `/.sprite/api.sock`

Used by the `sprite-env` CLI inside the sprite.

**Scope:** Services and checkpoints for this sprite only. Cannot modify network policy, URL settings, or other sprite configuration—those must be managed externally.

See [Internal API](/api/internal) for details.
