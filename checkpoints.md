# Checkpoints

Point-in-time snapshots of the filesystem overlay.

## Commands

```bash
sprite-env checkpoints list                 # List all
sprite-env checkpoints get <id>             # Get details
sprite-env checkpoints create               # Create new
sprite-env checkpoints restore <id>         # Restore
```

## Versioning

Checkpoints are versioned as `v0`, `v1`, `v2`, etc.

## Access

Last 5 checkpoints mounted at `/.sprite/checkpoints/`:

```bash
ls /.sprite/checkpoints/v0/home/sprite/
cp /.sprite/checkpoints/v1/file.txt ./
diff /.sprite/checkpoints/v0/app.js /.sprite/checkpoints/v1/app.js
```

## What's Captured

| Captured | Not Captured |
|----------|--------------|
| Filesystem changes | Running processes |
| Installed packages | Network connections |
| Service definitions | Session state |
| Configuration files | Base image |

## Restore

Restore is async and triggers environment restart:

```bash
sprite-env checkpoints restore v1
# Environment restarts, services auto-start
```
