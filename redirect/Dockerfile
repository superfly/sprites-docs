# syntax = docker/dockerfile:1

# Replaces the Astro build that used to serve docs.sprites.dev. No build step,
# so a deploy takes under a minute rather than several.
FROM caddy:2-alpine

COPY redirect/Caddyfile /etc/caddy/Caddyfile
