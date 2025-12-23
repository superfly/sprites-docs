# Lifecycle

## States

**Running** — Actively servicing HTTP requests or detachable sessions

**Paused** — Idle, state preserved, resumes on next request

**Stopped** — Detachable sessions lost, services restart at boot

## Service Behavior

Services created with `sprite-env services create`:
- Restart automatically at boot
- Auto-start when HTTP requests arrive (if `--http-port` configured)
- Dependencies start first when using `--needs`

## Persistence

| Persists | Lost on Stop |
|----------|--------------|
| Filesystem overlay | Running processes |
| Service definitions | Detachable sessions |
| Checkpoints | Network connections |
