# HTTP Routing

## Default Behavior

HTTP requests to the Sprite URL route to port 8080.

## Custom Port

Use `--http-port` to route to a different port:

```bash
sprite-env services create myapp \
  --cmd node --args app.js --http-port 3000
```

## Constraints

- Only **one** service can have `--http-port` at a time
- Service must bind to `0.0.0.0`, not `localhost`
- Service auto-starts when requests arrive

## Host Binding

```javascript
// Node.js - correct
app.listen(3000, '0.0.0.0')

// Python Flask
flask run --host 0.0.0.0 --port 5000

// Ruby Rails
rails server -b 0.0.0.0 -p 3000
```
