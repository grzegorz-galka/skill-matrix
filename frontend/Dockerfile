# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Runtime stage - use unprivileged nginx for OpenShift
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# The image's entrypoint renders templates with envsubst into conf.d at startup
ENV BACKEND_URL=http://backend:8080
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]