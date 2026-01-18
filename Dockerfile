# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build argument for Gemini API Key (needed at build time for static bundle)
ARG EXPO_PUBLIC_GEMINI_API_KEY
ENV EXPO_PUBLIC_GEMINI_API_KEY=$EXPO_PUBLIC_GEMINI_API_KEY

# Build for web
RUN npm run export

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Start Nginx
# Start Nginx with Runtime Environment Variable Replacement
# We search for the placeholder and replace it with the actual ENV var value provided by Cloud Run
CMD ["/bin/sh", "-c", "echo 'Starting replacement...'; find /usr/share/nginx/html -type f \\( -name '*.js' -o -name '*.html' -o -name '*.json' \\) -exec sed -i \"s~GEMINI_API_KEY_PLACEHOLDER~${EXPO_PUBLIC_GEMINI_API_KEY}~g\" {} +; echo 'Replacement complete.'; nginx -g 'daemon off;'"]
