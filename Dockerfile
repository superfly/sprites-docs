# syntax = docker/dockerfile:1

ARG BUN_VERSION=1.3.2
FROM oven/bun:${BUN_VERSION}-slim AS build

WORKDIR /app
ENV NODE_ENV="production"

# Install packages needed for sharp native module
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy and build
COPY . .
RUN bun run build

# Final stage - minimal nginx
FROM nginx:alpine

# SPA routing + caching for static assets
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ $uri.html /index.html;\n\
    }\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
