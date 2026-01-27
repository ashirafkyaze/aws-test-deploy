# Build stage for frontend
FROM node:18-alpine as build

WORKDIR /app

# Install frontend dependencies
COPY client/package*.json ./
RUN npm install

# Copy frontend code
COPY client/ .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy frontend build to Nginx folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx config (with reverse proxy)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy backend code
COPY server /app/server
WORKDIR /app/server
RUN npm install

# Expose ports
EXPOSE 80 3000

# Start backend and Nginx together
CMD sh -c "node server.js & nginx -g 'daemon off;'"
