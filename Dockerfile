# syntax = docker/dockerfile:1

FROM node:22-slim AS build

WORKDIR /app
ENV NODE_ENV="production"

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install packages needed for sharp native module and CLI
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git pkg-config python-is-python3 curl && \
    rm -rf /var/lib/apt/lists/*

# Install Sprites CLI
RUN curl -fsSL https://sprites.dev/install.sh | bash
ENV PATH="/root/.local/bin:$PATH"

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy and build (skip CLI tests in Docker - no API access)
COPY . .
ENV SKIP_CLI_TESTS=true
RUN pnpm run build

# Final stage - minimal nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY .htpasswd /etc/nginx/.htpasswd
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
