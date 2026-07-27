# Stage 1: Build the Vite React app
FROM node:22-alpine AS builder
WORKDIR /app

# 1. Copy package files first (enables Docker layer caching for dependencies)
COPY package*.json ./

# 2. Install dependencies
RUN npm ci

# 3. Accept build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# 4. Copy the rest of the application code and build static assets
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]