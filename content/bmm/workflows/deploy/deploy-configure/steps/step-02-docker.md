# Step 2: Docker Configuration

## Action 1: Generate Dockerfile

Based on the discovery, generate an optimized multi-stage Dockerfile.

Show the proposed Dockerfile:

```
📋 ACCIÓN PROPUESTA: Crear Dockerfile

<Show the complete Dockerfile content>
```

The Dockerfile MUST follow these best practices:
- Multi-stage build (build stage + production stage)
- Pin exact base image versions (e.g., `node:20.11-alpine`, not `node:latest`)
- Non-root user for production stage
- .dockerignore to exclude unnecessary files
- Minimal final image size (alpine when possible)
- Health check endpoint if applicable
- Proper signal handling (SIGTERM)

Example structure for Node.js:
```dockerfile
# Build stage
FROM node:<version>-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN <build_command>

# Production stage
FROM node:<version>-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./
USER app
EXPOSE <port>
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:<port>/health || exit 1
CMD ["node", "dist/main.js"]
```

> ¿Procedo a crear el fichero? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Write Dockerfile to project root.

---

## Action 2: Generate .dockerignore

```
📋 ACCIÓN PROPUESTA: Crear .dockerignore

node_modules
npm-debug.log
.git
.gitignore
.cursor
.env
.env.*
!.env.example
dist
coverage
*.md
!README.md
_bmad
_bmad-output
docs
.github
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

---

## Action 3: Generate docker-compose.yml (if applicable)

Only if the project needs database, cache, or multiple services.

```
📋 ACCIÓN PROPUESTA: Crear docker-compose.yml

<Show the complete docker-compose content with:>
- App service (builds from Dockerfile)
- Database service (if needed)
- Volume mounts for data persistence
- Network configuration
- Environment variables from .env
- Health checks
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

If project is a simple static app or single service without DB:
> docker-compose.yml no es necesario para este proyecto. Salto al siguiente paso.

---

## Action 4: Generate .env.example

```
📋 ACCIÓN PROPUESTA: Crear .env.example

# Application
NODE_ENV=production
PORT=<port>

# Database (if applicable)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=<project_name>
DB_USER=
DB_PASSWORD=

# External APIs (if applicable)
# API_KEY=
# API_SECRET=
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

⚠️ Remind the user:
> **IMPORTANTE:** `.env.example` se commitea al repo (es la plantilla).
> `.env` con los valores reales NUNCA se commitea — ya está en .gitignore.

---

## Step Summary

```
DOCKER CONFIGURATION:
├── Dockerfile:        [✅ | ❌ | ⏭]
├── .dockerignore:     [✅ | ❌ | ⏭]
├── docker-compose.yml: [✅ | ❌ | ⏭ N/A]
└── .env.example:      [✅ | ❌ | ⏭]
```

Present menu:
- **[C] Continue** — proceed to CI/CD pipeline
- **[R] Retry** — retry any failed action
