# Filesystem

## Structure

```
/.sprite/
├── api.sock              # Internal API socket
├── bin/                  # Language shims (node, python, ruby, etc.)
├── checkpoints/          # Last 5 checkpoints mounted
├── languages/            # Version managers and runtimes
│   ├── node/nvm/
│   ├── python/pyenv/
│   ├── ruby/rbenv/
│   ├── rust/rustup/
│   ├── go/
│   ├── erlang/kerl/
│   ├── elixir/
│   ├── java/sdkman/
│   ├── bun/
│   └── deno/
├── logs/services/        # Service stdout/stderr
├── policy/network.json   # Network egress policy
└── version.txt           # Environment version

/home/sprite/             # User home directory
```

## Overlay

The filesystem uses a copy-on-write overlay:
- Base image is read-only
- All modifications stored in overlay
- Checkpoints capture only the overlay
- Base image upgraded independently
