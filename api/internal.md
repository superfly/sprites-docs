# Internal API

Available inside the sprite via Unix socket. Used by the `sprite-env` CLI.

**Socket:** `/.sprite/api.sock`

**Scope:** Services and checkpoints for this sprite only.

Cannot modify: network policy, URL settings, sprite configuration, or anything else—those require the [External API](/api/).

```bash
curl --unix-socket /.sprite/api.sock http://sprite/v1/services
```

Or use the CLI wrapper:
```bash
sprite-env curl /v1/services
```

---

## Services

### List Services

```
GET /v1/services
```

```json
[
  {
    "name": "myapp",
    "cmd": "/usr/bin/node",
    "args": ["server.js"],
    "env": {"NODE_ENV": "production"},
    "dir": "/home/sprite/app",
    "needs": [],
    "http_port": 3000,
    "state": {
      "status": "running",
      "pid": 1234,
      "started_at": "2025-01-01T00:00:00Z",
      "restart_count": 0
    }
  }
]
```

### Get Service

```
GET /v1/services/{name}
```

### Create/Update Service

```
PUT /v1/services/{name}
```

```json
{
  "cmd": "/usr/bin/node",
  "args": ["server.js"],
  "env": {"NODE_ENV": "production"},
  "dir": "/home/sprite/app",
  "needs": ["postgres"],
  "http_port": 3000
}
```

Query params:
- `duration` — Log stream duration (e.g., `10s`, `1m`)

Response streams NDJSON:

```json
{"type": "started", "data": "Service myapp started"}
{"type": "stdout", "data": "Server listening on :3000"}
{"type": "complete", "log_files": {"stdout": "/.sprite/logs/services/myapp.log"}}
```

### Delete Service

```
DELETE /v1/services/{name}
```

### Start/Stop Service

```
POST /v1/services/{name}/start
POST /v1/services/{name}/stop
```

### Signal Service

```
POST /v1/services/signal
```

```json
{
  "name": "myapp",
  "signal": "TERM"
}
```

---

## Checkpoints

### List Checkpoints

```
GET /v1/checkpoints
GET /v1/checkpoints?history=v1.2.3
```

### Get Checkpoint

```
GET /v1/checkpoints/{id}
```

### Create Checkpoint

```
POST /v1/checkpoint
```

Streams NDJSON progress.

### Restore Checkpoint

```
POST /v1/checkpoints/{id}/restore
```

Triggers async restore and environment restart.
