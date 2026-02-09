# OpenShift Sandbox Deployment Plan

## Overview

Deploy the Employee Skills Management application to Red Hat OpenShift Sandbox using CLI commands with persistent PostgreSQL storage.

**Components:**
- PostgreSQL 16 with persistent storage
- Spring Boot 3.x backend (Java 21)
- React frontend served via nginx

---

## Phase 1: Prerequisites

### 1.1 Install OpenShift CLI

**Linux:**
```bash
curl -LO https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz
tar -xvf oc.tar.gz
sudo mv oc /usr/local/bin/
```

**Windows (PowerShell):**
```powershell
# Download from: https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/windows/oc.zip
# Extract and add to PATH
```

### 1.2 Login to OpenShift Sandbox

1. Go to https://console.redhat.com/openshift/sandbox
2. Click "Copy login command" from the user menu
3. Run the command:
```bash
oc login --token=sha256~XXXXX --server=https://api.sandbox-m2.ll9k.p1.openshiftapps.com:6443
```

### 1.3 Verify Connection
```bash
oc whoami
oc project
```

---

## Phase 2: Create Dockerfiles

### 2.1 Backend Dockerfile

**File:** `backend/Dockerfile`

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2.2 Frontend Dockerfile

**File:** `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 2.3 Nginx Configuration

**File:** `frontend/nginx.conf`

```nginx
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Phase 3: Add CORS Configuration

**File:** `backend/src/main/java/org/gga/skills/config/CorsConfig.java`

```java
package org.gga.skills.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

## Phase 4: Deploy to OpenShift (CLI Commands)

### 4.1 Deploy PostgreSQL with Persistent Storage

```bash
# Create persistent PostgreSQL deployment
oc new-app postgresql:16-el9 \
  --name=postgresql \
  -e POSTGRESQL_USER=skills_user \
  -e POSTGRESQL_PASSWORD=skills_pass \
  -e POSTGRESQL_DATABASE=skills_db

# Create PVC for PostgreSQL data
oc set volume deployment/postgresql \
  --add --name=postgresql-data \
  --type=pvc \
  --claim-size=1Gi \
  --mount-path=/var/lib/pgsql/data

# Wait for PostgreSQL to be ready
oc rollout status deployment/postgresql
```

### 4.2 Deploy Backend

```bash
# Create backend from GitHub (Docker strategy)
oc new-app --name=backend \
  --strategy=docker \
  --context-dir=backend \
  https://github.com/<YOUR-GITHUB-USERNAME>/skill-matrix.git

# Set environment variables for database connection
oc set env deployment/backend \
  DB_URL=jdbc:postgresql://postgresql:5432/skills_db \
  DB_USERNAME=skills_user \
  DB_PASSWORD=skills_pass

# Expose backend as a route
oc expose service backend

# Watch build progress
oc logs -f bc/backend
```

### 4.3 Deploy Frontend

```bash
# Get the backend route URL
BACKEND_ROUTE=$(oc get route backend -o jsonpath='{.spec.host}')
echo "Backend URL: https://${BACKEND_ROUTE}"

# Create frontend from GitHub
oc new-app --name=frontend \
  --strategy=docker \
  --context-dir=frontend \
  https://github.com/<YOUR-GITHUB-USERNAME>/skill-matrix.git \
  --build-env VITE_API_BASE_URL=https://${BACKEND_ROUTE}/api

# Expose frontend as a route
oc expose service frontend

# Watch build progress
oc logs -f bc/frontend
```

### 4.4 Configure TLS (HTTPS)

```bash
# Enable edge TLS termination for routes
oc create route edge backend-https --service=backend --insecure-policy=Redirect
oc create route edge frontend-https --service=frontend --insecure-policy=Redirect

# Delete the non-TLS routes
oc delete route backend frontend
```

---

## Phase 5: Verification

### 5.1 Check Deployment Status

```bash
# List all resources
oc get all

# Check pods are running
oc get pods

# Check routes
oc get routes
```

### 5.2 View Logs

```bash
# Backend logs
oc logs -f deployment/backend

# Frontend logs
oc logs -f deployment/frontend

# PostgreSQL logs
oc logs -f deployment/postgresql
```

### 5.3 Test Application

```bash
# Get frontend URL
FRONTEND_URL=$(oc get route frontend-https -o jsonpath='{.spec.host}')
echo "Application URL: https://${FRONTEND_URL}"

# Get backend URL for API testing
BACKEND_URL=$(oc get route backend-https -o jsonpath='{.spec.host}')
echo "Swagger UI: https://${BACKEND_URL}/swagger-ui.html"

# Test backend health
curl -k https://${BACKEND_URL}/api/employees
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `backend/Dockerfile` | Create | Multi-stage build for Spring Boot |
| `frontend/Dockerfile` | Create | Multi-stage build for React + nginx |
| `frontend/nginx.conf` | Create | Nginx config with API proxy |
| `backend/src/.../config/CorsConfig.java` | Create | CORS support for OpenShift domains |

---

## Troubleshooting

### Build Fails
```bash
# Check build logs
oc logs -f bc/backend
oc logs -f bc/frontend

# Restart build
oc start-build backend
oc start-build frontend
```

### Pod Crashes
```bash
# Check pod events
oc describe pod <pod-name>

# Check logs
oc logs <pod-name> --previous
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
oc get pods -l deployment=postgresql

# Test connection from backend pod
oc rsh deployment/backend
# Inside pod:
curl postgresql:5432
```

### Resource Limits (Sandbox)
```bash
# Check resource usage
oc describe quota

# Scale down if needed
oc scale deployment/backend --replicas=1
oc scale deployment/frontend --replicas=1
```

---

## Cleanup (Optional)

```bash
# Delete all application resources
oc delete all -l app=backend
oc delete all -l app=frontend
oc delete all -l app=postgresql
oc delete pvc --all
```

---

## Summary

**Estimated Time:** ~60-90 minutes (including build times)

**Final URLs:**
- Frontend: `https://frontend-<namespace>.apps.sandbox-m2.ll9k.p1.openshiftapps.com`
- Backend API: `https://backend-<namespace>.apps.sandbox-m2.ll9k.p1.openshiftapps.com/api`
- Swagger UI: `https://backend-<namespace>.apps.sandbox-m2.ll9k.p1.openshiftapps.com/swagger-ui.html`
