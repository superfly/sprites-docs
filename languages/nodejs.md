# Node.js

**Manager:** nvm | **Default:** 22.20.0 | **Location:** `/.sprite/languages/node/nvm`

## Version Management

```bash
nvm-helper list              # List installed
nvm-helper install 20.10.0   # Install
nvm-helper use 20.10.0       # Switch

# Or use nvm directly
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 20.10.0
```

## Project Version

Create `.nvmrc`:
```
20.10.0
```

## Global Packages

Each version has isolated globals:
```bash
npm install -g typescript
npm list -g --depth=0
```
