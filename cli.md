# CLI Reference

## Two CLIs

| CLI | Where | Purpose |
|-----|-------|---------|
| `sprite` | Local machine | Manage sprites externally (create, delete, settings, network policy) |
| `sprite-env` | Inside sprite | Manage services and checkpoints within this environment |

---

## sprite (local CLI)

Install: `go install github.com/superfly/sprites-go/cmd/sprite@latest`

```bash
sprite create my-sprite              # Create sprite
sprite list                          # List sprites
sprite delete my-sprite              # Delete sprite
sprite ssh my-sprite                 # SSH into sprite
sprite exec my-sprite -- command     # Run command
sprite checkpoint my-sprite          # Create checkpoint
sprite restore my-sprite v1          # Restore checkpoint
```

See [REST API](/api/) for full capabilities.

---

## sprite-env (inside sprite)

Available only inside the sprite environment. Manages services and checkpoints for this environment only.

```
sprite-env <command> [subcommand] [options]
```

### Commands

| Command | Description |
|---------|-------------|
| `services` | Manage services |
| `checkpoints` | Manage checkpoints |
| `curl` | API socket passthrough |
| `version` | Show version |

---

## services

### list
```bash
sprite-env services list
```

### get
```bash
sprite-env services get <name>
```

### create
```bash
sprite-env services create <name> \
  --cmd <command> \
  --args <a,b,c> \
  --env <K=V,K2=V2> \
  --dir <path> \
  --needs <svc1,svc2> \
  --http-port <port> \
  --duration <time> \
  --no-stream
```

### delete
```bash
sprite-env services delete <name>
```

### signal
```bash
sprite-env services signal <name> <TERM|HUP|KILL>
```

---

## checkpoints

### list
```bash
sprite-env checkpoints list
sprite-env checkpoints list --history <version>
```

### get
```bash
sprite-env checkpoints get <id>
```

### create
```bash
sprite-env checkpoints create
```

### restore
```bash
sprite-env checkpoints restore <id>
```

---

## curl

Passthrough to API socket:

```bash
sprite-env curl /v1/services
sprite-env curl -X POST /v1/checkpoint
sprite-env curl -X DELETE /v1/services/myapp
```
