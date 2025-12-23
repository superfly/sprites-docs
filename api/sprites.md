# Sprites API

External API for managing sprites. Used by the `sprite` CLI.

## Create Sprite {#create}

```
POST /v1/sprites
```

### Request

```json
{
  "name": "my-sprite"
}
```

### Response

```json
{
  "name": "my-sprite"
}
```

---

## List Sprites {#list}

```
GET /v1/sprites
```

### Query Parameters

| Param | Description |
|-------|-------------|
| `max_results` | Limit results |
| `prefix` | Filter by name prefix |
| `continuation_token` | Pagination token |

### Response

```json
{
  "sprites": [
    {
      "id": "...",
      "name": "my-sprite",
      "status": "running",
      "url": "https://my-sprite.sprites.dev",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "continuation_token": "..."
}
```

---

## Get Sprite {#get}

```
GET /v1/sprites/{name}
```

### Response

```json
{
  "id": "...",
  "name": "my-sprite",
  "organization_name": "...",
  "status": "running",
  "url": "https://my-sprite.sprites.dev",
  "url_settings": {
    "auth_required": true
  },
  "bucket_name": "...",
  "primary_region": "iad",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

## Update URL Settings {#update}

```
PUT /v1/sprites/{name}
```

### Request

```json
{
  "url_settings": {
    "auth_required": false
  }
}
```

Makes the sprite's HTTP endpoint publicly accessible.

---

## Delete Sprite {#delete}

```
DELETE /v1/sprites/{name}
```

---

## Upgrade Sprite {#upgrade}

Upgrade to latest base image.

```
POST /v1/sprites/{name}/upgrade
```

---

## Update Network Policy {#network}

```
PUT /v1/sprites/{name}/policy/network
```

### Request

```json
{
  "rules": [
    {"include": "defaults"},
    {"domain": "api.example.com", "action": "allow"}
  ]
}
```

See [Network Policy](/network) for rule format.
