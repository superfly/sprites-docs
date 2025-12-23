# Checkpoints API

## Create Checkpoint {#create}

```
POST /v1/sprites/{name}/checkpoint
```

### Query Parameters

| Param | Description |
|-------|-------------|
| `comment` | Optional comment |

### Response (streaming NDJSON)

```json
{"type": "info", "data": "Creating checkpoint..."}
{"type": "info", "data": "Checkpoint created successfully"}
{"type": "complete", "data": "Checkpoint v1 created"}
```

---

## List Checkpoints {#list}

```
GET /v1/sprites/{name}/checkpoints
```

### Query Parameters

| Param | Description |
|-------|-------------|
| `history` | Filter by history version |

### Response

```json
[
  {
    "id": "v0",
    "created_at": "2025-01-01T00:00:00Z",
    "comment": "Initial setup"
  },
  {
    "id": "v1",
    "created_at": "2025-01-02T00:00:00Z",
    "comment": "Added feature"
  }
]
```

---

## Get Checkpoint {#get}

```
GET /v1/sprites/{name}/checkpoints/{id}
```

### Response

```json
{
  "id": "v1",
  "created_at": "2025-01-02T00:00:00Z",
  "comment": "Added feature",
  "history": "v1.2.3"
}
```

---

## Restore Checkpoint {#restore}

```
POST /v1/sprites/{name}/checkpoints/{id}/restore
```

### Response (streaming NDJSON)

```json
{"type": "info", "data": "Restoring checkpoint v1..."}
{"type": "info", "data": "Restore complete"}
{"type": "complete", "data": "Environment restarting"}
```

Triggers async restore and environment restart.
