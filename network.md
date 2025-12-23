# Network Policy

DNS-based egress filtering at `/.sprite/policy/network.json`.

## Policy Format

```json
{
  "rules": [
    {"include": "defaults"},
    {"domain": "api.example.com", "action": "allow"},
    {"domain": "*.internal.corp", "action": "allow"},
    {"domain": "blocked.com", "action": "deny"}
  ]
}
```

## Rule Types

| Type | Example | Description |
|------|---------|-------------|
| Include | `{"include": "defaults"}` | Import predefined rules |
| Exact | `{"domain": "api.com", "action": "allow"}` | Match exact domain |
| Wildcard | `{"domain": "*.api.com", "action": "allow"}` | Match subdomains |
| Global | `{"domain": "*", "action": "allow"}` | Match all |

## Defaults

The `defaults` set includes:
- GitHub, npm, PyPI, RubyGems, crates.io
- Docker Hub, cloud providers
- AI APIs (OpenAI, Anthropic)

## Evaluation

Rules evaluated by specificity: exact > subdomain wildcard > global.

## Behavior

- Denied domains: DNS returns REFUSED
- Raw IP connections: Blocked unless resolved from allowed domain
- Private IPs: Always blocked
- Policy changes: Auto-reload, connections flushed

## Testing

```bash
dig allowed.com      # Should resolve
dig blocked.com      # Returns REFUSED
```

## Modification

Policy must be updated externally via Sprite API (not from inside container).
