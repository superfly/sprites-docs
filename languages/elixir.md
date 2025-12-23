# Elixir

**Manager:** elixir-version | **Default:** 1.18.4 (OTP 28) | **Location:** `/.sprite/languages/elixir`

Requires Erlang (runs on BEAM).

## Version Management

```bash
elixir-version list          # List installed
elixir-version install 1.17.0
elixir-version use 1.17.0
elixir-version current
```

## Project Version

Create `.tool-versions`:
```
elixir 1.17.0-otp-26
erlang 26.2
```

## Mix

```bash
mix new myproject
mix deps.get
mix compile
mix test
iex -S mix
```

## Phoenix

```bash
mix archive.install hex phx_new
mix phx.new myapp
mix ecto.create
mix phx.server
```
