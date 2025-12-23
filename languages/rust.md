# Rust

**Manager:** rustup | **Default:** 1.90.0 | **Location:** `/.sprite/languages/rust/rustup`

## Version Management

```bash
rustup show                          # Current toolchain
rustup toolchain install stable      # Install stable
rustup toolchain install nightly     # Install nightly
rustup toolchain install 1.75.0      # Specific version
rustup default stable                # Set default
rustup override set nightly          # Project-specific
rustup update                        # Update all
```

## Project Version

Create `rust-toolchain.toml`:
```toml
[toolchain]
channel = "1.75.0"
```

## Cargo

```bash
cargo new myapp
cargo build --release
cargo run
cargo install ripgrep
```
