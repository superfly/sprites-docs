# Go

**Manager:** go-version | **Default:** 1.25.1 | **Location:** `/.sprite/languages/go`

## Version Management

```bash
go-version list          # List installed
go-version install 1.22.0
go-version use 1.22.0
go-version current
```

## Modules

```bash
go mod init myproject
go get github.com/gin-gonic/gin
go mod tidy
go build
go run main.go
```

## Environment

```bash
go env GOPATH    # /.sprite/languages/go/workspace
go env GOROOT    # /.sprite/languages/go/current
```
