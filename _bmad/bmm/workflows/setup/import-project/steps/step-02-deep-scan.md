# Step 2 — Deep Project Scan

## Purpose
Analyze the existing codebase to understand what has been built, how it's structured, and what the application does functionally.

## Instructions

Perform a systematic scan of the project. Read source files, not just list them.

### 2a. Tech Stack Analysis

Read `package.json` (or equivalent), config files, and source imports to determine:

```
TECH STACK:
- Runtime: <Node.js, Python, Go, etc.>
- Language: <TypeScript, JavaScript, Python, etc.>
- Frontend framework: <React, Vue, Svelte, etc. | None>
- Backend framework: <Express, Fastify, Django, etc. | None>
- CSS/Styling: <Tailwind, Styled Components, CSS Modules, etc.>
- State management: <Context API, Redux, Zustand, etc.>
- Routing: <React Router, Next.js router, etc.>
- Database: <PostgreSQL, MongoDB, SQLite, etc. | None>
- ORM: <Prisma, Sequelize, TypeORM, etc. | None>
- Auth: <JWT, OAuth, sessions, etc. | None>
- Build tool: <Vite, Webpack, etc.>
- Deployment platform: <Vercel, AWS, Netlify, etc. | Unknown>
```

### 2b. Architecture Pattern Detection

Read the source directory structure and key files to determine:

```
ARCHITECTURE:
- Pattern: <monolith | frontend-only | fullstack | microservices | unknown>
- Entry points: <list main entry files>
- Key directories:
  - Components: <path and count>
  - Pages/Routes: <path and count>
  - API/Backend: <path or "None">
  - Data/Models: <path>
  - Utils/Helpers: <path>
  - Types/Interfaces: <path>
- Data flow: <brief description of how data moves through the app>
```

### 2c. Feature Inventory

Read pages, routes, and components to build a feature map. For EACH feature/page:

```
FEATURE INVENTORY:

1. <Feature/Page Name>
   - Route: <URL path>
   - Components: <list of components used>
   - Data dependencies: <what data it reads/writes>
   - Status: [COMPLETE | PARTIAL | STUB]
   - Notes: <any observations>

2. <next feature>
   ...
```

### 2d. Data Model

Read type definitions, interfaces, schemas, or database models:

```
DATA MODEL:
- Source: <types/*.ts, models/*.ts, schema.prisma, etc.>
- Entities:
  1. <Entity name>: <key fields and relationships>
  2. <next entity>
  ...
- Data storage: <database | API | static files | localStorage | none>
```

### 2e. External Dependencies

Identify integrations, APIs, services:

```
EXTERNAL DEPENDENCIES:
- APIs consumed: <list or "None">
- Third-party services: <Stripe, Auth0, SendGrid, etc. or "None">
- MCP servers needed: <based on platform and integrations>
```

## Output

Combine all sections into a single **Project Scan Report** and present to the user.

Save the report to: `_bmad-output/planning-artifacts/project-scan-report.md`

## Wait for [C] before proceeding to Step 3.
