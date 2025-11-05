# -----------------------------
# 🏗️ BUILDER STAGE
# -----------------------------
FROM node:18.20.0-slim AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./

# Install dependencies (force optional, prefer ci for reproducibility)
RUN npm ci || npm install --force

# Copy the rest of your project files
COPY . .

# Build the Vite app
RUN npx vite build



# -----------------------------
# 🧩 DEVELOPMENT STAGE
# -----------------------------
FROM node:18.20.0-slim AS development

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]




# -----------------------------
# 🚀 RUNNER STAGE (Nginx)
# -----------------------------
FROM nginx:alpine AS runner

# Remove the default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
