# Build frontend
FROM node:18-alpine AS build

WORKDIR /app

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build

# Nginx stage
FROM nginx:alpine

# Copy frontend build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy 
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
