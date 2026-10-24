# ==========================================
# STAGE 1: Build React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install npm dependencies
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Lightweight Production Nginx Server
# ==========================================
FROM nginx:1.27-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Remove default nginx static assets and configuration
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
