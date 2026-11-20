# Multi-stage build for Angular Frontend (Builds bundle from source inside Docker)
FROM node:22-slim AS builder

WORKDIR /app

ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Install dependencies with retry and maxsockets tolerance to prevent ECONNRESET
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 180000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retries 10 && \
    npm ci --no-audit --maxsockets 5

# Copy source files and compile production bundle
COPY . .
RUN npm run build -- --configuration production

# Production Nginx runtime
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled Angular bundle from builder stage
COPY --from=builder /app/dist/Frontend/browser /usr/share/nginx/html

# Copy custom reverse proxy & SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
