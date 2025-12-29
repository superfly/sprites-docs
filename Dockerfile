# syntax = docker/dockerfile:1

FROM node:22-slim AS build

WORKDIR /app
ENV NODE_ENV="production"

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install packages needed for sharp native module
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy and build
COPY . .
RUN pnpm run build

# Final stage - minimal nginx
FROM nginx:alpine

# Static site routing + caching for static assets
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    error_page 404 /404.html;\n\
    location / {\n\
        try_files $uri $uri/ $uri.html =404;\n\
    }\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
