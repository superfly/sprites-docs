# Java

**Manager:** SDKMAN | **Default:** 25-tem | **Location:** `/.sprite/languages/java/sdkman`

## Setup

```bash
export SDKMAN_DIR="/.sprite/languages/java/sdkman"
source "$SDKMAN_DIR/bin/sdkman-init.sh"
```

## Version Management

```bash
sdk list java                # List available
sdk install java 21.0.2-tem  # Install
sdk default java 21.0.2-tem  # Set default
sdk use java 17.0.9-tem      # Current shell
```

## Vendors

| Suffix | Vendor |
|--------|--------|
| `-tem` | Eclipse Temurin |
| `-graal` | GraalVM |
| `-zulu` | Azul Zulu |
| `-amzn` | Amazon Corretto |

## Build Tools

```bash
sdk install maven
sdk install gradle
mvn package
./gradlew build
```
