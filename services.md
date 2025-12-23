# Services

Long-running background processes managed by Sprite.

## Commands

```bash
sprite-env services list                    # List all
sprite-env services get <name>              # Get details
sprite-env services create <name> [opts]    # Create
sprite-env services delete <name>           # Delete
sprite-env services signal <name> <SIG>     # Send signal
```

## Create Options

| Option | Description |
|--------|-------------|
| `--cmd <command>` | Command to run (required) |
| `--args <a,b,c>` | Comma-separated arguments |
| `--env <K=V,...>` | Environment variables |
| `--dir <path>` | Working directory |
| `--needs <svc,...>` | Dependencies |
| `--http-port <port>` | HTTP proxy port |
| `--duration <time>` | Log stream duration |
| `--no-stream` | Don't stream logs |

## Examples

```bash
# Node.js app with HTTP
sprite-env services create api \
  --cmd node --args server.js --http-port 3000

# Python with env vars
sprite-env services create worker \
  --cmd python --args worker.py \
  --env DATABASE_URL=postgres://localhost/db

# With dependencies
sprite-env services create app \
  --cmd node --args app.js --needs postgres
```

## Logs

```
/.sprite/logs/services/<name>.stdout.log
/.sprite/logs/services/<name>.stderr.log
```

```bash
tail -f /.sprite/logs/services/myapp.stderr.log
```
