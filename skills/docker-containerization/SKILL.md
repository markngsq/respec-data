---
name: docker-containerization
emoji: 🐳
vibe: Ship anywhere with zero config drift
category: deployment
description: Docker containerization patterns for Next.js, React, and Node.js applications. Use when containerizing applications, creating Dockerfiles, docker-compose configurations, or deploying containers to Kubernetes, ECS, Cloud Run, etc.
maturity: seed
evolution_count: 0
tags:
  - docker
  - containers
  - devops
triggers:
  - writing or editing a Dockerfile
  - setting up docker-compose for local dev or production
  - building a multi-stage Docker image
  - deploying a container to Kubernetes, ECS, or Cloud Run
  - debugging a container that won't start or build
  - setting up a CI/CD pipeline with Docker
---

# Docker Containerization Skill

## Communication Style
- Show complete Dockerfile examples (not fragments)
- Include both local dev AND production configs
- Point out security implications (.dockerignore, secrets, USER directive)
- Assume basic Docker knowledge (build, run, image layers)

## Success Metrics
- ✅ Image size <200MB (Alpine base + multi-stage builds)
- ✅ Build time <2 minutes (layer caching optimized)
- ✅ Zero secrets in image layers
- ✅ Non-root USER in production
- ✅ .dockerignore present and comprehensive

<!-- ZONE:STABLE -->
## Overview

Generate production-ready Docker configurations for modern web applications, particularly Next.js and Node.js projects. This skill provides Dockerfiles, docker-compose setups, bash scripts for container management, and comprehensive deployment guides for various orchestration platforms.

## Core Capabilities

### 1. Dockerfile Generation

Create optimized Dockerfiles for different environments:

**Production** (`assets/Dockerfile.production`):
- Multi-stage build reducing image size by 85%
- Alpine Linux base (~180MB final image)
- Non-root user execution for security
- Health checks and resource limits

**Development** (`assets/Dockerfile.development`):
- Hot reload support
- All dev dependencies included
- Volume mounts for live code updates

**Nginx Static** (`assets/Dockerfile.nginx`):
- Static export optimization
- Nginx reverse proxy included
- Smallest possible footprint

### 2. Docker Compose Configuration

Multi-container orchestration with `assets/docker-compose.yml`:
- Development and production services
- Network and volume management
- Health checks and logging
- Restart policies

### 3. Bash Scripts for Container Management

**docker-build.sh** - Build images with comprehensive options:
```bash
./docker-build.sh -e prod -t v1.0.0
./docker-build.sh -n my-app --no-cache --platform linux/amd64
```

**docker-run.sh** - Run containers with full configuration:
```bash
./docker-run.sh -i my-app -t v1.0.0 -d
./docker-run.sh -p 8080:3000 --env-file .env.production
```

**docker-push.sh** - Push to registries (Docker Hub, ECR, GCR, ACR):
```bash
./docker-push.sh -n my-app -t v1.0.0 --repo username/my-app
./docker-push.sh -r gcr.io/project --repo my-app --also-tag stable
```

**docker-cleanup.sh** - Free disk space:
```bash
./docker-cleanup.sh --all --dry-run  # Preview cleanup
./docker-cleanup.sh --containers --images  # Clean specific resources
```

### 4. Configuration Files

- **`.dockerignore`**: Excludes unnecessary files (node_modules, .git, logs)
- **`nginx.conf`**: Production-ready Nginx configuration with compression, caching, security headers

### 5. Reference Documentation

**docker-best-practices.md** covers:
- Multi-stage builds explained
- Image optimization techniques (50-85% size reduction)
- Security best practices (non-root users, vulnerability scanning)
- Performance optimization
- Health checks and logging
- Troubleshooting guide

**container-orchestration.md** covers deployment to:
- Docker Compose (local development)
- Kubernetes (enterprise scale with auto-scaling)
- Amazon ECS (AWS-native orchestration)
- Google Cloud Run (serverless containers)
- Azure Container Instances
- Digital Ocean App Platform

Includes configuration examples, commands, auto-scaling setup, and monitoring.

## Workflow Decision Tree

### 1. What environment?
- **Development** → `Dockerfile.development` (hot reload, all dependencies)
- **Production** → `Dockerfile.production` (minimal, secure, optimized)
- **Static Export** → `Dockerfile.nginx` (smallest footprint)

### 2. Single or Multi-container?
- **Single** → Generate Dockerfile only
- **Multi** → Generate `docker-compose.yml` (app + database, microservices)

### 3. Which registry?
- **Docker Hub** → `docker.io/username/image`
- **AWS ECR** → `123456789012.dkr.ecr.region.amazonaws.com/image`
- **Google GCR** → `gcr.io/project-id/image`
- **Azure ACR** → `registry.azurecr.io/image`

### 4. Deployment platform?
- **Kubernetes** → See `references/container-orchestration.md` K8s section
- **ECS** → See ECS task definition examples
- **Cloud Run** → See deployment commands
- **Docker Compose** → Use provided compose file

### 5. Optimizations needed?
- **Image size** → Multi-stage builds, Alpine base
- **Build speed** → Layer caching, BuildKit
- **Security** → Non-root user, vulnerability scanning
- **Performance** → Resource limits, health checks

## Usage Examples

### Example 1: Containerize Next.js App for Production

**User**: "Containerize my Next.js app for production"

**Steps**:
1. Copy `assets/Dockerfile.production` to project root as `Dockerfile`
2. Copy `assets/.dockerignore` to project root
3. Build: `./docker-build.sh -e prod -n my-app -t v1.0.0`
4. Test: `./docker-run.sh -i my-app -t v1.0.0 -p 3000:3000 -d`
5. Push: `./docker-push.sh -n my-app -t v1.0.0 --repo username/my-app`

### Example 2: Development with Docker Compose

**User**: "Set up Docker Compose for local development"

**Steps**:
1. Copy `assets/Dockerfile.development` and `assets/docker-compose.yml` to project
2. Customize services in docker-compose.yml
3. Start: `docker-compose up -d`
4. Logs: `docker-compose logs -f app-dev`

### Example 3: Deploy to Kubernetes

**User**: "Deploy my containerized app to Kubernetes"

**Steps**:
1. Build and push image to registry
2. Review `references/container-orchestration.md` Kubernetes section
3. Create K8s manifests (deployment, service, ingress)
4. Apply: `kubectl apply -f deployment.yaml`
5. Verify: `kubectl get pods && kubectl logs -f deployment/app`

### Example 4: Deploy to AWS ECS

**User**: "Deploy to AWS ECS Fargate"

**Steps**:
1. Build and push to ECR
2. Review `references/container-orchestration.md` ECS section
3. Create task definition JSON
4. Register: `aws ecs register-task-definition --cli-input-json file://task-def.json`
5. Create service: `aws ecs create-service --cluster my-cluster --service-name app --desired-count 3`

## Anti-Patterns (Don't Do This)

### ❌ No .dockerignore File

```dockerfile
# BAD: Copies node_modules, .git, etc. into image
COPY . .
```

**Why it's bad:** Copies node_modules (hundreds of MBs), .git history, .env files, test files — massive image size + security risk.

**✅ Do this instead:**
```dockerignore
# .dockerignore
node_modules
.git
.env
.env.local
*.log
.next/cache
coverage
.vscode
```

dependencies:
  - name: Docker CLI
    url: https://docs.docker.com/engine/install/
    tier: free

---

### ❌ Running as Root User

```dockerfile
# BAD: Runs as root (UID 0)
FROM node:20-alpine
COPY . /app
CMD ["node", "server.js"]
```

**Why it's bad:** If container is compromised, attacker has root access.

**✅ Do this instead:**
```dockerfile
# GOOD: Non-root user
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
COPY --chown=nodejs:nodejs . /app
CMD ["node", "server.js"]
```

---

### ❌ Installing Dev Dependencies in Production

```dockerfile
# BAD: Installs devDependencies (eslint, typescript, etc.)
RUN npm install
```

**Why it's bad:** Adds 50-100MB of unnecessary packages (testing tools, build tools).

**✅ Do this instead:**
```dockerfile
# GOOD: Production-only deps
RUN npm ci --only=production
# OR with package managers that support workspaces:
RUN npm ci --workspace=api --omit=dev
```

---

### ❌ Using :latest Tag

```dockerfile
# BAD: Unpredictable base image
FROM node:latest
```

**Why it's bad:** `latest` tag changes over time → builds break, hard to debug, not reproducible.

**✅ Do this instead:**
```dockerfile
# GOOD: Specific version + digest (immutable)
FROM node:20.11.0-alpine@sha256:abc123...
# OR at minimum, pin major+minor:
FROM node:20-alpine
```

---

## Best Practices

### Security
✅ Use multi-stage builds for production
✅ Run as non-root user
✅ Use specific image tags (not `latest`)
✅ Scan for vulnerabilities
✅ Never hardcode secrets
✅ Implement health checks

### Performance
✅ Optimize layer caching order
✅ Use Alpine images (~85% smaller)
✅ Enable BuildKit for parallel builds
✅ Set resource limits
✅ Use compression

### Maintainability
✅ Add comments for complex steps
✅ Use build arguments for flexibility
✅ Keep Dockerfiles DRY
✅ Version control all configs
✅ Document environment variables

## Troubleshooting

**Image too large (>500MB)**
→ Use multi-stage builds, Alpine base, comprehensive .dockerignore

**Build is slow**
→ Optimize layer caching, use BuildKit, review dependencies

**Container exits immediately**
→ Check logs: `docker logs container-name`
→ Verify CMD/ENTRYPOINT, check port conflicts

**Changes not reflecting**
→ Rebuild without cache, check .dockerignore, verify volume mounts

## Quick Reference

```bash
# Build
./docker-build.sh -e prod -t latest

# Run
./docker-run.sh -i app -t latest -d

# Logs
docker logs -f app

# Execute
docker exec -it app sh

# Cleanup
./docker-cleanup.sh --all --dry-run  # Preview
./docker-cleanup.sh --all            # Execute
```

## Integration with CI/CD

### GitHub Actions
```yaml
- run: |
    chmod +x docker-build.sh docker-push.sh
    ./docker-build.sh -e prod -t ${{ github.sha }}
    ./docker-push.sh -n app -t ${{ github.sha }} --repo username/app
```

### GitLab CI
```yaml
build:
  script:
    - chmod +x docker-build.sh
    - ./docker-build.sh -e prod -t $CI_COMMIT_SHA
```

## Resources

### Scripts (`scripts/`)
Production-ready bash scripts with comprehensive features:
- `docker-build.sh` - Build images (400+ lines, colorized output)
- `docker-run.sh` - Run containers (400+ lines, auto conflict resolution)
- `docker-push.sh` - Push to registries (multi-registry support)
- `docker-cleanup.sh` - Clean resources (dry-run mode, selective cleanup)

### References (`references/`)
Detailed documentation loaded as needed:
- `docker-best-practices.md` - Comprehensive Docker best practices (~500 lines)
- `container-orchestration.md` - Deployment guides for 6+ platforms (~600 lines)

### Assets (`assets/`)
Ready-to-use templates:
- `Dockerfile.production` - Multi-stage production Dockerfile
- `Dockerfile.development` - Development Dockerfile
- `Dockerfile.nginx` - Static export with Nginx
- `docker-compose.yml` - Multi-container orchestration
- `.dockerignore` - Optimized exclusion rules
- `nginx.conf` - Production Nginx configuration

<!-- ZONE:APPEND -->
## Lessons Learned

### 2026-03-05 — Respec deploy (airbase + Next.js standalone)

**1. Always `chown -R` before `USER` switch in Dockerfiles (especially with pnpm)**

pnpm's content-addressable store creates directories as `drwx------` (root-only) during build. Next.js standalone output symlinks into `.pnpm` for node_modules. If you switch to a non-root user (`USER respec`) without re-owning first, those symlinks silently break at runtime — permission denied when the app tries to resolve modules.

Fix: always `RUN chown -R <user>:<group> /app` *after* all `COPY` steps and *before* `USER` switch.

```dockerfile
COPY packages/web/.next/standalone ./
COPY config ./config
RUN chown -R respec:respec /app   # ← must come AFTER copies
USER respec
```

**2. Pre-built Dockerfile pattern for Next.js standalone (preferred)**

Build on the host via `pnpm build`, copy artifacts into the image. No `npm install` or network calls inside Docker build.

Why this is better regardless of network issues:
- Hermetic images — no external dependency at build time
- Faster builds (no npm download step)
- Easier to debug (build failures surface on host, not inside container)

```dockerfile
# Build on host first:
# pnpm run build --filter @respec/web
# Then:
COPY packages/web/.next/standalone ./
COPY packages/web/.next/static ./packages/web/.next/static
```

**3. Docker Desktop proxy settings need a full GUI restart**

Backend.sock API (`/app/settings`) reads back correctly after write, but proxy/network changes don't take effect until Docker Desktop fully restarts via the UI. Attempting to work around via daemon.json or pihole DNS filtering is a rabbit hole — go to the GUI first.

Specific culprit: "Manual proxy" checkbox in Docker Desktop → Resources → Proxies. When checked with no proxy configured, VPNKit routes all traffic through a transparent proxy that tries IPv6 first. On machines with no IPv6 route, every `docker pull` hangs ~60s per host before falling back to IPv4.

Diagnosis: `curl -6 https://registry-1.docker.io` (hangs) vs `curl -4 https://registry-1.docker.io` (instant). If the `-4` works and `-6` doesn't, it's IPv6 + proxy, not DNS.

<!-- ZONE:APPEND -->
## Changelog
