# Step 1: Discovery

## Step 0: Secture Adaptation Gate (MANDATORY)

Execute your full `secture_adaptation` protocol:
1. Check MCP availability for likely platforms
2. Scan for existing deployment artifacts
3. Emit **ARTIFACT INVENTORY**
4. Declare **EXECUTION MODE**

**Wait for [C] before proceeding.**

If mode is **VERIFY** → Run quick validation of existing configs and finish.
If mode is **REFINE** → Skip to the relevant gaps.
If mode is **GENERATE** → Continue with full discovery.

---

## Question 1: Target Platform

> {user_name}, ¿dónde se va a desplegar este proyecto?

| Plataforma | Descripción | Ideal para |
|-----------|-------------|------------|
| **AWS ECS** | Contenedores Docker con load balancer | APIs, apps backend, microservicios |
| **AWS S3 + CloudFront** | Hosting estático con CDN | SPAs (Angular, React), landing pages |
| **Vercel** | Deploy automático desde Git | Next.js, frontends, Jamstack |
| **Netlify** | Deploy automático desde Git | Sites estáticos, Jamstack |
| **Servidor propio** | Docker + SSH | Servidores on-premise, VPS |

For options marked as "planned" in the provider_registry:

> ⚠️ Este proveedor aún no tiene workflow completo. Puedo generar los ficheros
> base (Dockerfile, pipeline) pero la configuración específica será manual.
> ¿Continúo? [C] / [S]

---

## Question 2: Environments

> ¿Qué entornos necesitas?

| Configuración | Entornos | Recomendado para |
|--------------|----------|------------------|
| **Mínima** | production | Proyectos pequeños, MVPs |
| **Estándar** | staging + production | Equipos pequeños, validación pre-prod |
| **Completa** | development + staging + production | Equipos medianos, QA formal |

---

## Question 3: Repository and CI/CD

> ¿Dónde está el código fuente?

Check if Milhouse already configured a repository (look for `docs/project/repository-setup.md`).

If found:
> He encontrado la configuración del repositorio:
> - URL: <repo_url>
> - Plataforma: GitHub
> - Estrategia de ramas: <strategy>
>
> ¿Uso esta configuración? [C] / [E]

If not found, ask:
> ¿Cuál es la URL del repositorio? (ej: https://github.com/org/repo)
> ¿Qué plataforma de CI/CD prefieres?

| CI/CD | Descripción |
|-------|-------------|
| **GitHub Actions** | Integrado con GitHub (recomendado si usas GitHub) |
| **GitLab CI** | Integrado con GitLab |
| **Ninguno por ahora** | Solo genero los ficheros de deploy, sin pipeline |

---

## Question 4: Tech Stack Details

> Necesito algunos datos técnicos para generar las configuraciones:

- **Runtime**: Node.js, Python, Java, .NET, etc.
- **Versión**: (ej: Node 20, Python 3.12)
- **Build command**: (ej: `npm run build`, `ng build --configuration production`)
- **Start command**: (ej: `npm start`, `node dist/main.js`)
- **Port**: (ej: 3000, 8080, 4200)
- **¿Necesita base de datos?**: Sí/No — ¿cuál?
- **¿Variables de entorno sensibles?**: Sí/No (API keys, secrets)

---

## Discovery Summary

Compile all answers into a deployment plan:

```
DEPLOYMENT PLAN: {project_name}

Platform:     <selected>
Environments: <list>
Repository:   <url>
CI/CD:        <selected>

Tech Stack:
├── Runtime:       <runtime + version>
├── Build:         <command>
├── Start:         <command>
├── Port:          <port>
├── Database:      <yes/no — type>
└── Env secrets:   <yes/no>

MCP Status:
├── <Platform> MCP: [✅ AVAILABLE | ❌ ARTIFACT-ONLY MODE]
└── GitHub MCP:     [✅ AVAILABLE | ❌ NOT CONFIGURED]

Artifacts to generate:
├── Dockerfile:           ✅
├── docker-compose.yml:   <✅ if database or multi-service | ⏭ if simple>
├── CI/CD pipeline:       <✅ if CI/CD selected | ⏭>
├── Deploy config:        ✅ (<platform-specific>)
├── .env.example:         ✅
└── Deployment docs:      ✅
```

> ¿Todo correcto? **[C]** Continuar / **[E]** Editar / **[S]** Cancelar

Present menu:
- **[C] Continue** — proceed to generate Docker configuration
