# BMAD MCP Server

> Todo el Método BMAD en tu IDE, sin instalación por proyecto.

**bmad-mcp** es un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) que da a cualquier IDE con IA acceso instantáneo al **Método BMAD** completo — 13 agentes especializados, 38 workflows, templates, datos de referencia y el motor de ejecución de workflows — sin copiar archivos en cada proyecto.

---

## Tabla de Contenidos

- [¿Qué es BMAD?](#qué-es-bmad)
- [¿Qué es un servidor MCP?](#qué-es-un-servidor-mcp)
- [¿Por qué bmad-mcp?](#por-qué-bmad-mcp)
- [Inicio Rápido](#inicio-rápido)
- [Configuración por Plataforma](#configuración-por-plataforma)
  - [Claude Code](#claude-code)
  - [Cursor](#cursor)
  - [Windsurf](#windsurf)
  - [VS Code (Copilot)](#vs-code-copilot)
  - [Servidor Remoto (HTTP)](#servidor-remoto-http)
- [Configuración](#configuración)
- [Tools Disponibles (15)](#tools-disponibles-15)
- [Resources Disponibles (5)](#resources-disponibles-5)
- [Agentes](#agentes)
- [Workflows](#workflows)
- [Cómo Funciona](#cómo-funciona)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Self-Hosting](#self-hosting)
- [Desarrollo](#desarrollo)
- [Arquitectura](#arquitectura)
- [FAQ](#faq)
- [Licencia](#licencia)

---

## ¿Qué es BMAD?

**BMAD** (Breakthrough Method of Agile AI-driven Development) es un framework integral para desarrollo de software asistido por IA. Proporciona:

- **13 agentes de IA especializados** — cada uno con una personalidad única, experiencia y conjunto de workflows
- **38 workflows estructurados** — que cubren todo el ciclo de vida del desarrollo de software, desde brainstorming hasta despliegue
- **4 fases de desarrollo** — Análisis, Planificación, Diseño de Solución e Implementación
- **Templates, checklists y datos de referencia** — para resultados consistentes y de alta calidad
- **Un motor de ejecución de workflows** — que guía a la IA paso a paso en procesos complejos multi-step

Piensa en ello como un "sistema operativo" completo para desarrollo guiado por IA, donde cada agente es un miembro especialista del equipo (Product Manager, Arquitecto, Developer, QA, etc.) y cada workflow es un proceso probado que siguen.

---

## ¿Qué es un servidor MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) es un estándar abierto creado por Anthropic que permite a los asistentes de IA conectarse con fuentes de datos y herramientas externas. Un servidor MCP expone:

- **Tools** — Funciones que la IA puede llamar (como `bmad_list_workflows` o `bmad_get_agent`)
- **Resources** — Datos estáticos que la IA puede leer (como el catálogo de workflows o el overview del método)

Cuando añades un servidor MCP a tu IDE, la IA obtiene nuevas capacidades. En este caso, obtiene acceso a toda la metodología BMAD.

---

## ¿Por qué bmad-mcp?

### Antes: Instalación por proyecto

```bash
# Había que hacer esto en CADA proyecto
npx bmad-method install
# Crea el directorio _bmad/ con 260+ archivos en tu proyecto
```

### Después: Una configuración global

```jsonc
// Añadir una vez a tu IDE — funciona en todos los proyectos
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"]
    }
  }
}
```

### Ventajas clave

| | Instalación por proyecto | Servidor MCP |
|---|---|---|
| **Setup** | `npx install` por proyecto | Config global una sola vez |
| **Archivos en tu repo** | 260+ archivos en `_bmad/` | Cero |
| **Actualizaciones** | Reinstalar por proyecto | Actualizar una vez globalmente |
| **Funciona en IDEs** | Solo Claude Code | Claude Code, Cursor, Windsurf, VS Code |
| **Compartir en equipo** | Cada miembro instala | Compartir un servidor remoto |
| **Acceso al contenido** | Lectura de archivos (lento) | Indexado en memoria (rápido) |
| **Búsqueda** | Navegación manual de archivos | `bmad_search_content` en todo el contenido |

---

## Inicio Rápido

### Opción 1: npx (recomendado)

No necesita instalación. Solo añade a la configuración de tu IDE:

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"]
    }
  }
}
```

### Opción 2: Instalación global

```bash
npm install -g bmad-mcp
```

### Opción 3: Desde código fuente

```bash
git clone https://github.com/RomeroSecture/bmad-s-mcp.git
cd bmad-mcp
npm install
npm run build
```

---

## Configuración por Plataforma

### Claude Code

Añadir a `~/.claude/settings.json` (global) o `.claude/settings.json` (por proyecto):

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"],
      "env": {
        "BMAD_USER_NAME": "TuNombre",
        "BMAD_LANG": "Spanish",
        "BMAD_SKILL_LEVEL": "expert"
      }
    }
  }
}
```

Reinicia Claude Code. Los 15 tools de BMAD aparecerán automáticamente.

### Cursor

Añadir a `.cursor/mcp.json` en tu proyecto o configuración global:

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"],
      "env": {
        "BMAD_USER_NAME": "TuNombre",
        "BMAD_LANG": "Spanish"
      }
    }
  }
}
```

### Windsurf

Añadir a la configuración MCP de Windsurf:

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"],
      "env": {
        "BMAD_USER_NAME": "TuNombre"
      }
    }
  }
}
```

### VS Code (Copilot)

Añadir a `settings.json` de VS Code:

```json
{
  "mcp": {
    "servers": {
      "bmad": {
        "command": "npx",
        "args": ["-y", "bmad-mcp"],
        "env": {
          "BMAD_USER_NAME": "TuNombre"
        }
      }
    }
  }
}
```

### Servidor Remoto (HTTP)

Para acceso de todo el equipo, despliega una vez y conecta desde cualquier IDE:

```json
{
  "mcpServers": {
    "bmad": {
      "url": "https://tu-servidor.ejemplo.com/mcp"
    }
  }
}
```

Ver [Self-Hosting](#self-hosting) para instrucciones de despliegue.

---

## Configuración

### Variables de Entorno

Personaliza el comportamiento de BMAD configurando variables de entorno en tu config MCP:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `BMAD_USER_NAME` | `"BMad"` | Cómo se dirigen los agentes a ti |
| `BMAD_LANG` | `"English"` | Idioma para la comunicación de los agentes |
| `BMAD_DOC_LANG` | `"English"` | Idioma para los documentos generados |
| `BMAD_SKILL_LEVEL` | `"intermediate"` | `beginner` / `intermediate` / `expert` — ajusta la verbosidad |
| `BMAD_PROJECT_NAME` | nombre del directorio | Nombre de tu proyecto |
| `BMAD_OUTPUT_FOLDER` | `"_bmad-output"` | Dónde guardan los workflows los archivos de salida |
| `BMAD_TRANSPORT` | `"stdio"` | `stdio` (local) o `http` (remoto) |
| `BMAD_HTTP_PORT` | `3000` | Puerto para el transporte HTTP |

### Prioridad de Configuración

Los ajustes se resuelven en este orden (el primero gana):

1. **Variables de entorno** — configuradas en tu config MCP
2. **Config local del proyecto** — `{proyecto}/_bmad/bmm/config.yaml` (si existe)
3. **Defaults** — valores por defecto sensatos incluidos

Esto significa que puedes establecer preferencias globales vía env vars y sobreescribirlas por proyecto si lo necesitas.

---

## Tools Disponibles (15)

### Tools de Descubrimiento

| Tool | Descripción | Ejemplo de Input |
|------|-------------|-----------------|
| `bmad_list_agents` | Listar todos los agentes con roles, iconos y códigos de workflow | `{ "module": "bmm" }` |
| `bmad_list_workflows` | Explorar el catálogo completo de workflows | `{ "phase": "2-planning" }` |
| `bmad_list_templates` | Listar templates de documentos disponibles | `{ "module": "bmm" }` |
| `bmad_list_data` | Listar archivos de datos, protocolos y referencias | `{ "category": "all" }` |
| `bmad_help` | Enrutamiento inteligente — recomienda el siguiente workflow | `{ "context": "PRD is done" }` |

### Tools de Entrega de Contenido

| Tool | Descripción | Ejemplo de Input |
|------|-------------|-----------------|
| `bmad_get_agent` | Cargar la definición completa de un agente (persona, rol, menú) | `{ "agent_id": "architect" }` |
| `bmad_get_workflow` | Cargar un workflow por código o ruta | `{ "workflow_code": "CP" }` |
| `bmad_get_step` | Cargar un paso específico de un workflow | `{ "workflow_path": "bmm/workflows/2-plan-workflows/create-prd", "step_file": "step-01-init.md" }` |
| `bmad_get_template` | Cargar un template con placeholders | `{ "template_path": "bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md" }` |
| `bmad_get_data` | Cargar un archivo de datos/referencia | `{ "data_path": "bmm/data/project-context-template.md" }` |
| `bmad_get_task` | Cargar un motor de tareas (workflow.xml, help.md) | `{ "task_name": "workflow" }` |
| `bmad_get_protocol` | Cargar la definición de un protocolo | `{ "protocol_name": "ELP" }` |
| `bmad_get_config` | Ver la configuración resuelta | `{}` |

### Tools Avanzados

| Tool | Descripción | Ejemplo de Input |
|------|-------------|-----------------|
| `bmad_get_checklist` | Obtener checklist de validación de un workflow | `{ "workflow_path": "bmm/workflows/4-implementation/code-review/workflow.yaml" }` |
| `bmad_search_content` | Búsqueda full-text en todo el contenido BMAD | `{ "query": "sprint planning", "file_types": ["md", "yaml"] }` |

---

## Resources Disponibles (5)

Los resources MCP son datos estáticos que la IA puede leer bajo demanda:

| URI del Resource | Descripción |
|---|---|
| `bmad://config` | Configuración actual resuelta (YAML) |
| `bmad://catalog/workflows` | Catálogo completo de workflows con metadata (JSON) |
| `bmad://catalog/agents` | Roster completo de agentes con roles y capacidades (JSON) |
| `bmad://docs/overview` | Overview compilado del Método BMAD (Markdown) |
| `bmad://core/workflow-engine` | El motor `workflow.xml` para ejecutar workflows YAML (XML) |

---

## Agentes

BMAD incluye 13 agentes especializados, cada uno con una personalidad única, experiencia y conjunto de workflows:

| Icono | Nombre | Rol | Workflows Principales |
|-------|--------|-----|----------------------|
| 📊 | **Monty** | Analista de Negocio | Brainstorm, Investigación, Crear Brief |
| 📋 | **Lisa** | Product Manager | Crear/Validar/Editar PRD, Epics & Stories |
| 🎨 | **Marge** | Diseñadora UX | Crear Diseño UX |
| 🏗️ | **Frink** | Arquitecto | Crear Arquitectura, Preparación para Implementación |
| 🏃 | **Ned** | Scrum Master | Sprint Planning, Crear Story, Retrospectiva |
| 💻 | **Homer** | Developer | Dev Story, Code Review |
| 🧪 | **Edna** | QA Engineer | Tests de Automatización QA |
| 🚀 | **Bart** | Quick Flow Solo Dev | Quick Spec, Quick Dev |
| 📚 | **Kent** | Technical Writer | Escribir Documento, Diagramas Mermaid, Explicar Conceptos |
| 🗂️ | **Milhouse** | Git & Repositorio | Configurar Repo, Gestionar PRs |
| 🚀 | **Wiggum** | Deploy & CI/CD | Configurar Deploy, Ejecutar Deploy |
| 🔧 | **Smithers** | Setup & Onboarding | Setup Proyecto, Setup MCPs |
| 🧙 | **BMad Master** | Orquestador Maestro | Coordinación cross-agente, Custodio del Conocimiento |

Para cargar un agente, usa:
```
bmad_get_agent({ "agent_id": "architect" })
```

---

## Workflows

### Fases del Ciclo de Vida

BMAD organiza el desarrollo en 4 fases secuenciales más utilidades disponibles en cualquier momento:

```
  Herramientas Anytime (disponibles en cualquier fase)
         │
    ┌────┴────┐
    ▼         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│  1. Análisis    │────▶│  2. Planificación│────▶│  3. Solución    │────▶│  4. Implementación  │
│                 │     │                  │     │                 │     │                     │
│  Brainstorm     │     │  Crear PRD ★     │     │  Arquitectura ★ │     │  Sprint Plan ★      │
│  Invest. Mercado│     │  Validar PRD     │     │  Epics/Stories ★│     │  Crear Story ★      │
│  Invest. Dominio│     │  Editar PRD      │     │  Preparación ★  │     │  Dev Story ★        │
│  Invest. Técnica│     │  Crear UX        │     │                 │     │  Code Review        │
│  Crear Brief    │     │                  │     │                 │     │  QA Tests           │
│                 │     │                  │     │                 │     │  Retrospectiva      │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────────┘
                                                                          ★ = requerido
```

### Herramientas Anytime

Funcionan en cualquier fase y no requieren progresión de fases:

| Código | Workflow | Agente | Descripción |
|--------|----------|--------|-------------|
| QS | Quick Spec | Bart | Spec rápida para tareas simples sin planificación BMAD completa |
| QD | Quick Dev | Bart | Implementación rápida para tareas puntuales |
| DP | Document Project | Monty | Analizar proyecto existente para producir documentación |
| GPC | Generate Project Context | Monty | Escanear codebase para archivo de contexto optimizado para LLM |
| CC | Correct Course | Ned | Navegar cambios significativos a mitad de proyecto |
| WD | Write Document | Kent | Crear documentación siguiendo mejores prácticas |
| MG | Mermaid Generate | Kent | Crear diagramas Mermaid |
| VD | Validate Document | Kent | Revisar documentos contra estándares |
| EC | Explain Concept | Kent | Crear explicaciones técnicas con ejemplos |
| PM | Party Mode | - | Orquestación de discusión multi-agente |
| BH | bmad-help | - | Enrutamiento inteligente al siguiente workflow recomendado |

### Fase 1: Análisis

| Código | Workflow | Descripción |
|--------|----------|-------------|
| BP | Brainstorm Project | Facilitación guiada a través de técnicas de brainstorming |
| MR | Market Research | Análisis de mercado, panorama competitivo, necesidades del cliente |
| DR | Domain Research | Inmersión profunda en la industria, conocimiento especializado |
| TR | Technical Research | Viabilidad técnica, opciones de arquitectura |
| CB | Create Brief | Experiencia guiada para definir tu idea de producto |

### Fase 2: Planificación

| Código | Workflow | Requerido | Descripción |
|--------|----------|-----------|-------------|
| CP | Create PRD | **Sí** | Facilitación experta para el Documento de Requisitos de Producto |
| VP | Validate PRD | No | Validar que el PRD sea completo y coherente |
| EP | Edit PRD | No | Mejorar y perfeccionar un PRD existente |
| CU | Create UX | No | Workflow guiado de diseño UX |

### Fase 3: Diseño de Solución

| Código | Workflow | Requerido | Descripción |
|--------|----------|-----------|-------------|
| CA | Create Architecture | **Sí** | Workflow guiado para documentar decisiones técnicas |
| CE | Create Epics & Stories | **Sí** | Crear el listado completo de epics y stories |
| IR | Check Implementation Readiness | **Sí** | Asegurar que PRD, UX, Arquitectura y Stories están alineados |

### Fase 4: Implementación

| Código | Workflow | Requerido | Descripción |
|--------|----------|-----------|-------------|
| SP | Sprint Planning | **Sí** | Generar plan de sprint para iniciar la implementación |
| CS | Create Story | **Sí** | Preparar la siguiente story para desarrollo |
| DS | Dev Story | **Sí** | Ejecutar implementación de story y tests |
| CR | Code Review | No | Revisar código, volver a DS o siguiente story |
| QA | QA Automation Test | No | Generar tests automatizados para código implementado |
| SS | Sprint Status | No | Resumir progreso del sprint y enrutar siguiente |
| ER | Retrospective | No | Revisar trabajo completado y lecciones aprendidas |

---

## Cómo Funciona

### Arquitectura

```
Tu IDE (Claude Code / Cursor / Windsurf / VS Code)
     │
     │  Protocolo MCP
     ▼
┌─────────────────────────────────────┐
│  bmad-mcp server                    │
│                                     │
│  ContentRegistry (262 archivos)     │
│  ├── core/    (tareas, workflows)   │
│  ├── bmm/     (agentes, workflows)  │
│  └── utility/ (templates)           │
│                                     │
│  15 Tools + 5 Resources             │
└─────────────────────────────────────┘
```

### El Flujo

1. **Le pides a la IA** algo como "Quiero crear un PRD para mi proyecto"
2. **La IA llama** a `bmad_list_workflows` o `bmad_help` para encontrar el workflow correcto
3. **La IA llama** a `bmad_get_agent({ "agent_id": "pm" })` para cargar a Lisa, la Product Manager
4. **La IA llama** a `bmad_get_workflow({ "workflow_code": "CP" })` para cargar el workflow Create PRD
5. **La IA sigue** los pasos del workflow, llamando a `bmad_get_step` para cada paso
6. **La IA usa** templates vía `bmad_get_template` para estructurar la salida
7. **Obtienes** un PRD profesional creado a través de facilitación guiada por expertos

El servidor MCP es un **servidor de contenido** — sirve el contenido de la metodología. La IA en tu IDE es el **motor de ejecución** — lee el contenido y sigue las instrucciones, igual que lo haría con archivos locales.

### Decisiones de Diseño Clave

- **Contenido empaquetado** — Los 262 archivos BMAD (2.1 MB) están incluidos en el servidor. Sin llamadas de red para obtener contenido en tiempo de ejecución.
- **Indexado al arrancar** — Cada archivo se categoriza e indexa en un registro en memoria para búsquedas en sub-milisegundos.
- **Sin estado** — El servidor no tiene estado de sesión. La IA gestiona el contexto conversacional; BMAD gestiona el estado de documentos vía archivos de salida.
- **Tools granulares** — 15 tools pequeños y enfocados en vez de pocos grandes. Los LLMs funcionan mejor con schemas de tools específicos.

---

## Ejemplos de Uso

### Iniciar un proyecto nuevo desde cero

```
Tú: "Quiero construir una app de gestión de tareas. Ayúdame a planificarlo con BMAD."

La IA llama: bmad_help({ "context": "proyecto nuevo, sin artefactos aún" })
La IA llama: bmad_get_agent({ "agent_id": "analyst" })
La IA llama: bmad_get_workflow({ "workflow_code": "BP" })
→ Inicia sesión de brainstorming guiada como Monty el Analista
```

### Crear un PRD

```
Tú: "Vamos a crear el PRD"

La IA llama: bmad_get_agent({ "agent_id": "pm" })
La IA llama: bmad_get_workflow({ "workflow_code": "CP" })
La IA llama: bmad_get_step({ "workflow_path": "bmm/workflows/2-plan-workflows/create-prd", "step_file": "step-01-init.md", "steps_dir": "steps-c" })
→ Lisa te guía a través de 12 pasos para crear un PRD completo
```

### Tarea rápida puntual

```
Tú: "Solo necesito añadir una página de login, nada sofisticado"

La IA llama: bmad_get_agent({ "agent_id": "quick-flow-solo-dev" })
La IA llama: bmad_get_workflow({ "workflow_code": "QD" })
→ Bart hace una implementación rápida sin planificación BMAD completa
```

### Saber qué hacer a continuación

```
Tú: "¿Qué debo hacer después de terminar la arquitectura?"

La IA llama: bmad_help({ "context": "arquitectura completada" })
→ Recomienda: Create Epics & Stories [CE] (requerido), luego Implementation Readiness [IR]
```

### Buscar contenido

```
Tú: "Encuentra todo lo relacionado con sprint planning"

La IA llama: bmad_search_content({ "query": "sprint planning", "file_types": ["md", "yaml"] })
→ Devuelve archivos coincidentes con contexto a nivel de línea
```

---

## Self-Hosting

### Docker (para acceso de equipo/remoto)

Construir y ejecutar con Docker:

```bash
docker build -t bmad-mcp .
docker run -d \
  -p 3000:3000 \
  -e BMAD_TRANSPORT=http \
  --name bmad-mcp \
  bmad-mcp
```

### Docker Compose con Traefik

```yaml
# docker-compose.prod.yml
services:
  bmad-mcp:
    image: bmad-mcp:latest
    container_name: bmad-mcp
    restart: unless-stopped
    environment:
      - BMAD_TRANSPORT=http
      - BMAD_HTTP_PORT=3000
    networks:
      - traefik-public
    labels:
      - traefik.enable=true
      - traefik.http.routers.bmad-mcp.rule=Host(`bmad.tudominio.com`)
      - traefik.http.routers.bmad-mcp.entrypoints=https
      - traefik.http.routers.bmad-mcp.tls=true
      - traefik.http.routers.bmad-mcp.tls.certresolver=letsencrypt
      - traefik.http.services.bmad-mcp.loadbalancer.server.port=3000

networks:
  traefik-public:
    external: true
```

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Health Check

```bash
curl https://bmad.tudominio.com/health
# {"status":"ok","server":"bmad-mcp"}
```

### Configuración de Equipo

Una vez desplegado, cada miembro del equipo añade una línea a su IDE:

```json
{
  "mcpServers": {
    "bmad": {
      "url": "https://bmad.tudominio.com/mcp"
    }
  }
}
```

---

## Desarrollo

### Prerrequisitos

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/RomeroSecture/bmad-s-mcp.git
cd bmad-mcp
npm install
npm run sync-content   # Copiar contenido BMAD del repo padre
npm run build
```

### Comandos

```bash
npm run build          # Compilar TypeScript → dist/
npm run dev            # Ejecutar con hot reload (tsx)
npm start              # Ejecutar servidor compilado
npm run sync-content   # Re-sincronizar contenido del repo BMAD-S
npm test               # Ejecutar tests
npm run test:watch     # Ejecutar tests en modo watch
```

### Probar localmente

```bash
# Probar transporte stdio
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js

# Probar transporte HTTP
BMAD_TRANSPORT=http node dist/index.js
curl http://localhost:3000/health
```

---

## Arquitectura

### Estructura del Proyecto

```
bmad-mcp/
├── src/
│   ├── index.ts                 # Entry point — selecciona transporte stdio o http
│   ├── server.ts                # Crea McpServer, registra tools + resources
│   ├── transport/
│   │   ├── stdio.ts             # Transporte stdio local (por defecto)
│   │   └── http.ts              # Transporte HTTP remoto (Express + StreamableHTTP)
│   ├── config/
│   │   ├── schema.ts            # Schemas de validación Zod
│   │   ├── loader.ts            # Resolución de config (env → local → defaults)
│   │   └── variables.ts         # Motor de variables BMAD ({project-root}, {{date}}, etc.)
│   ├── content/
│   │   ├── registry.ts          # Índice de archivos en memoria (construido al arrancar)
│   │   └── reader.ts            # Lector de archivos con resolución de rutas
│   ├── tools/                   # 15 implementaciones de tools MCP
│   │   └── index.ts             # Orquestador de registro
│   ├── resources/               # 5 definiciones de resources MCP
│   │   └── index.ts
│   └── utils/
│       ├── csv-parser.ts        # Parser de module-help.csv
│       ├── yaml-parser.ts       # Parser de YAML de agentes
│       └── path-resolver.ts     # Traducción de rutas de contenido
├── content/                     # Contenido BMAD empaquetado (262 archivos, ~2.1 MB)
│   ├── core/                    # Tareas core, workflows y el agente maestro
│   ├── bmm/                     # Módulo principal: agentes, workflows, protocolos
│   └── utility/                 # Componentes de agente compartidos y templates
├── scripts/
│   └── sync-content.ts          # Sincroniza _bmad/ desde el repo BMAD-S
├── Dockerfile                   # Build multi-stage para producción
├── docker-compose.prod.yml      # Config de despliegue lista para Traefik
└── test/                        # Suites de tests Vitest
```

### Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Lenguaje | TypeScript 5.8 |
| MCP SDK | `@modelcontextprotocol/sdk` 1.12+ |
| Validación | Zod 3.25+ |
| Parsing YAML | js-yaml 4.1 |
| Parsing CSV | csv-parse 6.1 |
| Servidor HTTP | Express 5.1 |
| Tests | Vitest 3.2 |

---

## FAQ

### ¿Todavía necesito instalar BMAD por proyecto?

**No.** Ese es precisamente el objetivo. El servidor MCP empaqueta todo el contenido BMAD y lo sirve bajo demanda. No necesitas el directorio `_bmad/` en tus proyectos.

### ¿Funciona offline?

**Sí**, cuando usas el transporte stdio (el default). Todo el contenido está empaquetado en el servidor — no se requiere internet.

### ¿Puedo usarlo con un proyecto que ya tiene `_bmad/` instalado?

**Sí.** Si existe un `_bmad/bmm/config.yaml` local, el servidor lo lee para configuraciones específicas del proyecto (como rutas de salida). Los tools MCP tienen prioridad para la entrega de contenido.

### ¿Cuál es la diferencia entre transporte stdio y HTTP?

- **stdio** (default) — El IDE lanza el servidor como subproceso. Rápido, funciona offline, sin configuración de red.
- **HTTP** — El servidor corre como servicio web. Útil para compartir con el equipo o acceso remoto desde múltiples máquinas.

### ¿Cómo actualizo el contenido BMAD?

Si ejecutas desde código fuente:
```bash
npm run sync-content   # Obtener lo último del repo BMAD-S
npm run build          # Recompilar
```

Si usas npx, el contenido se actualiza cuando se publica una nueva versión.

### ¿Puedo personalizar el comportamiento de los agentes?

Sí, mediante variables de entorno:
- `BMAD_SKILL_LEVEL` ajusta la verbosidad (beginner recibe más explicación, expert recibe salida concisa)
- `BMAD_LANG` establece el idioma de comunicación
- `BMAD_DOC_LANG` establece el idioma de los documentos de salida

### ¿Cómo sé qué workflow usar?

Llama a `bmad_help` — analiza el estado de tu proyecto y recomienda el siguiente workflow basado en la progresión de fases y artefactos completados.

### ¿Puede todo mi equipo usar un solo servidor?

**Sí.** Despliega vía Docker con transporte HTTP, y cada miembro del equipo se conecta con una configuración de URL de una línea. El servidor no tiene estado, así que maneja usuarios concurrentes de forma natural.

---

## Licencia

MIT
