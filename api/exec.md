# Execution API

Execute commands on sprites remotely via WebSocket.

## List Sessions

```
GET /v1/sprites/{name}/exec
```

Lists active execution sessions that can be reattached.

### Response

```json
[
  {
    "id": "abc123",
    "cmd": ["node", "app.js"],
    "started_at": "2025-01-01T00:00:00Z",
    "active": true
  }
]
```

---

## Execute Command

```
GET /v1/sprites/{name}/exec?cmd=<command>&arg=<arg1>&arg=<arg2>
```

WebSocket upgrade required. Initiates command execution.

### Query Parameters

| Param | Description |
|-------|-------------|
| `cmd` | Command to run |
| `arg` | Command argument (repeat for multiple) |
| `dir` | Working directory |
| `env` | Environment variable `KEY=value` (repeat for multiple) |
| `tty` | Enable TTY mode (`true`/`false`) |
| `rows` | TTY rows (with `tty=true`) |
| `cols` | TTY columns (with `tty=true`) |

### Example

```
GET /v1/sprites/my-sprite/exec?cmd=node&arg=server.js&dir=/home/sprite/app
```

```
GET /v1/sprites/my-sprite/exec?cmd=bash&tty=true&rows=24&cols=80
```

### WebSocket Messages

**From server:**

```json
{"type": "stdout", "data": "Server started"}
{"type": "stderr", "data": "Warning: ..."}
{"type": "exit", "exit_code": 0}
```

| Type | Description |
|------|-------------|
| `info` | Informational message |
| `stdout` | Standard output |
| `stderr` | Standard error |
| `error` | Error message |
| `exit` | Process exited (includes `exit_code`) |

**To server (TTY mode):**

```json
{"type": "stdin", "data": "ls -la\n"}
{"type": "resize", "rows": 30, "cols": 120}
```

---

## Reattach Session

```
GET /v1/sprites/{name}/exec/{session_id}
```

WebSocket upgrade required. Reattaches to an existing session.

---

## Port Forwarding

```
GET /v1/sprites/{name}/proxy?local=<port>&remote=<port>
```

WebSocket upgrade required. Forwards traffic between local and remote ports.

### Query Parameters

| Param | Description |
|-------|-------------|
| `local` | Local port |
| `remote` | Remote port on sprite |

### Port Notifications

When a port opens on the sprite:

```json
{"type": "port_open", "port": 3000, "pid": 1234}
```

When closed:

```json
{"type": "port_close", "port": 3000}
```
