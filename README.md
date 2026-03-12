# BMAD-S MCP Server

> Todo el Método BMAD-S en tu IDE, sin instalación por proyecto.

**bmad-mcp** es un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) que da a cualquier IDE con IA acceso instantáneo al **Método BMAD-S** completo — 13 agentes especializados, 38 workflows, documentación de la metodología, templates, datos de referencia y el motor de ejecución de workflows — sin copiar archivos en cada proyecto.

**BMAD-S** es la edición de [Secture](https://secture.com) de **BMAD** (Breakthrough Method of Agile AI-driven Development), adaptada a las necesidades y flujos de trabajo de la empresa.

---

## Tabla de Contenidos

- [¿Qué es BMAD-S?](#qué-es-bmad-s)
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
- [Tools Disponibles (26)](#tools-disponibles-26)
- [Resources Disponibles (10)](#resources-disponibles-10)
- [Prompts Disponibles (8)](#prompts-disponibles-8)
- [Agentes](#agentes)
- [Workflows](#workflows)
- [Documentación de la Metodología](#documentación-de-la-metodología)
- [Cómo Funciona](#cómo-funciona)
- [Migración: De Archivos Locales a MCP](#migración-de-archivos-locales-a-mcp)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Self-Hosting](#self-hosting)
- [Desarrollo](#desarrollo)
- [Arquitectura](#arquitectura)
- [FAQ](#faq)
- [Licencia](#licencia)

---

## ¿Qué es BMAD-S?

**BMAD-S** es la edición **Secture** de **BMAD** (Breakthrough Method of Agile AI-driven Development) — un framework integral para desarrollo de software asistido por IA. [Secture](https://secture.com) mantiene y adapta esta edición para las necesidades de su equipo y proyectos.

BMAD-S proporciona:

- **13 agentes de IA especializados** — cada uno con una personalidad única, experiencia y conjunto de workflows
- **38 workflows estructurados** — que cubren todo el ciclo de vida del desarrollo de software, desde brainstorming hasta despliegue
- **4 fases de desarrollo** — Análisis, Planificación, Diseño de Solución e Implementación
- **Templates, checklists y datos de referencia** — para resultados consistentes y de alta calidad
- **Un motor de ejecución de workflows** — que guía a la IA paso a paso en procesos complejos multi-step
- **Documentación completa de la metodología** — tutoriales, guías how-to, explicaciones conceptuales y referencia técnica

Piensa en ello como un "sistema operativo" completo para desarrollo guiado por IA, donde cada agente es un miembro especialista del equipo (Product Manager, Arquitecto, Developer, QA, etc.) y cada workflow es un proceso probado que siguen.

---

## ¿Qué es un servidor MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) es un estándar abierto creado por Anthropic que permite a los asistentes de IA conectarse con fuentes de datos y herramientas externas. Un servidor MCP expone:

- **Tools** — Funciones que la IA puede llamar (como `bmad_list_workflows` o `bmad_get_agent`)
- **Resources** — Datos estáticos que la IA puede leer (como el catálogo de workflows o el overview del método)

Cuando añades un servidor MCP a tu IDE, la IA obtiene nuevas capacidades. En este caso, obtiene acceso a toda la metodología BMAD-S.

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

Reinicia Claude Code. Los 26 tools de BMAD-S aparecerán automáticamente.

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

## Tools Disponibles (26)

### Tools de Descubrimiento (5)

| Tool | Descripción | Ejemplo de Input |
|------|-------------|-----------------|
| `bmad_list_agents` | Listar todos los agentes con roles, iconos y códigos de workflow | `{ "module": "bmm" }` |
| `bmad_list_workflows` | Explorar el catálogo completo de workflows | `{ "phase": "2-planning" }` |
| `bmad_list_templates` | Listar templates de documentos disponibles | `{ "module": "bmm" }` |
| `bmad_list_data` | Listar archivos de datos, protocolos y referencias | `{ "category": "all" }` |
| `bmad_help` | Enrutamiento inteligente — recomienda el siguiente workflow | `{ "context": "PRD is done" }` |

### Tools de Entrega de Contenido (8)

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

### Tools Avanzados (2)

| Tool | Descripción | Ejemplo de Input |
|------|-------------|-----------------|
| `bmad_get_checklist` | Obtener checklist de validación de un workflow | `{ "workflow_path": "bmm/workflows/4-implementation/code-review/workflow.yaml" }` |
| `bmad_search_content` | Búsqueda full-text en todo el contenido BMAD-S | `{ "query": "sprint planning", "file_types": ["md", "yaml"] }` |

### Tools de Documentación (2)

| Tool | Descripción | Ejemplo de Input |
|------|-------------|-----------------|
| `bmad_list_docs` | Listar documentación de la metodología por categoría | `{ "category": "how-to" }` |
| `bmad_get_doc` | Obtener un documento por ruta o tema | `{ "topic": "brainstorming" }` |

Las categorías disponibles son: `tutorials`, `how-to`, `explanation`, `reference`, `bmgd` (BMAD Game Development), y `all`.

### Tools de Estado del Proyecto (9)

Estos tools acceden al estado del proyecto en runtime (`_bmad-output/`, `docs/project/`). Requieren `BMAD_PROJECT_ROOT` o ejecutar el servidor desde un directorio con `_bmad/`. Si no están disponibles, devuelven un error descriptivo sin crashear.

| Tool | Descripción | Lectura/Escritura |
|------|-------------|-------------------|
| `bmad_get_execution_log` | Leer entradas ELP con filtros (all/orphans/errors) | Lectura |
| `bmad_write_execution_entry` | Escribir entrada ELP (STARTED o cierre) | **Escritura** |
| `bmad_get_project_status` | Dashboard completo (artefactos, ejecuciones, sprint, inconsistencias) | Lectura |
| `bmad_get_sprint_status` | Archivo de estado del sprint actual | Lectura |
| `bmad_list_stories` | Listar stories con filtrado por status/epic | Lectura |
| `bmad_get_story` | Obtener contenido completo de una story por ID | Lectura |
| `bmad_get_artifact_inventory` | Escaneo VRG de artefactos con recomendación de modo (VERIFY/REFINE/GENERATE) | Lectura |
| `bmad_list_elicitation_methods` | 50 técnicas avanzadas de elicitation desde methods.csv | Lectura |
| `bmad_recover_execution` | Recuperación de errores (FX): diagnosticar o resolver ejecuciones huérfanas | **Escritura** |

---

## Resources Disponibles (10)

Los resources MCP son datos estáticos que la IA puede leer bajo demanda:

| URI del Resource | Descripción |
|---|---|
| `bmad://config` | Configuración actual resuelta (YAML) |
| `bmad://catalog/workflows` | Catálogo completo de workflows con metadata (JSON) |
| `bmad://catalog/agents` | Roster completo de agentes con roles y capacidades (JSON) |
| `bmad://catalog/elicitation-methods` | 50 técnicas avanzadas de elicitation (JSON) |
| `bmad://catalog/teams` | Teams disponibles del framework (JSON) |
| `bmad://docs/overview` | Overview del Método BMAD-S con documentación real (Markdown) |
| `bmad://core/workflow-engine` | El motor `workflow.xml` para ejecutar workflows YAML (XML) |
| `bmad://project/execution-log` | Log de ejecución actual (YAML) — requiere project root |
| `bmad://project/sprint-status` | Estado del sprint actual (YAML) — requiere project root |
| `bmad://project/artifact-inventory` | Inventario VRG de artefactos (JSON) — requiere project root |

---

## Prompts Disponibles (8)

Los prompts MCP son instrucciones predefinidas que la IA puede usar como punto de partida:

| Prompt | Descripción |
|--------|-------------|
| `bmad-create-prd` | Workflow guiado de creación de PRD |
| `bmad-create-architecture` | Workflow guiado de diseño de arquitectura |
| `bmad-quick-spec` | Quick spec para tareas simples |
| `bmad-brainstorm` | Facilitación de sesión de brainstorming |
| `bmad-sprint-planning` | Workflow de planificación de sprint |
| `bmad-diagnose` | Diagnóstico de proyecto — artefactos + ejecuciones + inconsistencias |
| `bmad-sprint-status` | Dashboard de sprint — estado + stories |
| `bmad-elicitation` | Selección y aplicación de técnicas avanzadas de elicitation |

---

## Agentes

BMAD-S incluye 13 agentes especializados, cada uno con una personalidad única, experiencia y conjunto de workflows:

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

## Documentación de la Metodología

BMAD-S incluye documentación completa de la metodología, accesible directamente desde el MCP:

| Categoría | Contenido | Ejemplo |
|-----------|-----------|---------|
| **tutorials** | Guías paso a paso para empezar | Getting Started |
| **how-to** | Guías prácticas para tareas específicas | Cómo personalizar BMAD, Quick Fixes, Shard Large Documents |
| **explanation** | Explicaciones conceptuales en profundidad | Brainstorming, Party Mode, Quick Flow, Why Solutioning Matters |
| **reference** | Referencia técnica | Mapa de workflows, Agentes, Módulos, Comandos |
| **bmgd** | BMAD Game Development | Tipos de juegos, Quick Flow para juegos |

### Acceder a la documentación

```
Tú: "¿Cómo funciona el brainstorming en BMAD?"

La IA llama: bmad_get_doc({ "topic": "brainstorming" })
→ Recibe la guía completa sobre la funcionalidad de brainstorming
```

```
Tú: "¿Qué documentación hay disponible?"

La IA llama: bmad_list_docs({ "category": "all" })
→ Lista de 30+ documentos organizados por categoría
```

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
│  ContentRegistry (296 archivos)     │
│  ├── core/    (tareas, workflows)   │
│  ├── bmm/     (agentes, workflows)  │
│  ├── utility/ (templates)           │
│  └── docs/    (metodología)         │
│                                     │
│  26 Tools + 10 Resources + 8 Prompts│
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

- **Contenido empaquetado** — Los 296 archivos BMAD-S (contenido + documentación) están incluidos en el servidor. Sin llamadas de red para obtener contenido en tiempo de ejecución.
- **Indexado al arrancar** — Cada archivo se categoriza e indexa en un registro en memoria para búsquedas en sub-milisegundos.
- **Sin estado** — El servidor no tiene estado de sesión. La IA gestiona el contexto conversacional; BMAD gestiona el estado de documentos vía archivos de salida.
- **Tools granulares** — 26 tools pequeños y enfocados (17 contenido + 9 estado del proyecto) en vez de pocos grandes. Los LLMs funcionan mejor con schemas de tools específicos.
- **Separación Content vs Project** — ContentRegistry (framework estático, 296 archivos) vs ProjectReader (estado del proyecto en runtime: ELP, VRG, sprint). Graceful degradation cuando el project root no está disponible.

---

## Migración: De Archivos Locales a MCP

Si antes usabas BMAD con la instalación por proyecto (`npx bmad-method install`), los workflows contenían referencias a archivos locales en el directorio `_bmad/`. Con el servidor MCP, **todas esas referencias se transforman automáticamente a llamadas MCP**. No necesitas hacer nada manualmente.

### Transformación Automática

El servidor incluye un **Content Transformer** que procesa todo el contenido antes de servirlo. Cuando un workflow, step o agente contiene una referencia como:

```
Read fully and follow: {project-root}/_bmad/core/workflows/brainstorming/steps/step-01.md
```

El servidor lo transforma automáticamente a:

```
Read fully and follow: bmad_get_step({"workflow_path":"core/workflows/brainstorming","step_file":"step-01.md"})
```

La IA del IDE recibe directamente la instrucción MCP y sabe qué tool llamar, sin necesidad de interpretar rutas de archivos locales.

### Patrones que se Transforman

El transformador maneja **todos** los patrones de referencia del contenido BMAD:

| Patrón en archivo original | Se transforma a | Ejemplo |
|---|---|---|
| `{project-root}/_bmad/bmm/agents/X.agent.yaml` | `bmad_get_agent(...)` | `bmad_get_agent({ "agent_id": "architect" })` |
| `{project-root}/_bmad/core/config.yaml` | `bmad_get_config(...)` | `bmad_get_config({})` |
| `{project-root}/_bmad/core/tasks/workflow.xml` | `bmad_get_task(...)` | `bmad_get_task({ "task_name": "workflow" })` |
| `{project-root}/_bmad/bmm/protocols/...` | `bmad_get_protocol(...)` | `bmad_get_protocol({ "protocol_name": "ELP" })` |
| `{installed_path}/steps/step-02.md` | `bmad_get_step(...)` | Con workflow_path y step_file resueltos |
| `{installed_path}/templates/prd-template.md` | `bmad_get_template(...)` | Con template_path completo |
| `{installed_path}/brain-methods.csv` | `bmad_get_data(...)` | Con data_path completo |
| `./steps/step-02-discovery.md` | `bmad_get_step(...)` | Rutas relativas resueltas según contexto del archivo |
| `../templates/prd-template.md` | `bmad_get_template(...)` | Rutas relativas resueltas |
| `Read fully and follow: <path>` | Directiva con tool MCP | La instrucción se preserva, la ruta se reemplaza |
| `Load step: <path>` | Directiva con tool MCP | Idem |
| `_config/agent-manifest.csv` | `bmad_list_agents(...)` | Manifests internos mapeados a tools de lista |
| `_config/workflow-manifest.csv` | `bmad_list_workflows(...)` | Idem |
| Frontmatter: `nextStepFile`, `prdTemplate`, etc. | Comentario YAML con tool hint | `nextStepFile: './step-02.md' # → bmad_get_step(...)` |

### Ejemplo Real: Workflow Brainstorming

**Contenido original** (como está en `_bmad/`):
```markdown
### Configuration Loading
Load config from `{project-root}/_bmad/core/config.yaml` and resolve...

### Paths
- `brain_techniques_path` = `{installed_path}/brain-methods.csv`
- `advancedElicitationTask` = `{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml`

## EXECUTION
Read fully and follow: `steps/step-01-session-setup.md`
```

**Lo que recibe la IA del IDE** (transformado):
```markdown
### Configuration Loading
Load config from `bmad_get_config({})` and resolve...

### Paths
- `brain_techniques_path` = `bmad_get_data({ "data_path": "core/workflows/brainstorming/brain-methods.csv" })`
- `advancedElicitationTask` = `bmad_get_workflow({ "workflow_path": "core/workflows/advanced-elicitation/workflow.xml" })`

## EXECUTION
Read fully and follow: bmad_get_step({"workflow_path":"core/workflows/brainstorming","step_file":"step-01-session-setup.md"})
```

### Qué NO se Transforma

- **Archivos de salida** — Rutas como `{output_folder}/brainstorming/session.md` se mantienen intactas, ya que son archivos que se escriben en el proyecto local del usuario.
- **Variables de configuración** — `{user_name}`, `{{date}}`, `{communication_language}` se resuelven por separado vía `bmad_get_config`.
- **Contenido CSV/YAML interno** — Los archivos que el servidor parsea internamente (module-help.csv, agent YAML) se leen sin transformar para no romper el parsing.
- **Resultados de búsqueda** — `bmad_search_content` devuelve contenido crudo para búsqueda precisa.

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

### Consultar la documentación de la metodología

```
Tú: "Explícame cómo funciona el party mode en BMAD"

La IA llama: bmad_get_doc({ "topic": "party mode" })
→ Recibe la documentación completa sobre Party Mode
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
npm run build          # Ejecuta sync-content automáticamente via prebuild
```

### Comandos

```bash
npm run build          # sync-content + tsc (genera content/ y compila)
npm run dev            # Ejecutar con hot reload (tsx)
npm start              # Ejecutar servidor compilado
npm run sync-content   # Regenerar content/ desde _bmad/ con transformaciones MCP
npm test               # Ejecutar tests
npm run test:watch     # Ejecutar tests en modo watch
```

### Actualizar contenido BMAD-S

El contenido raw vive en `_bmad/` (workflows, agentes) y `_docs/` (documentación de la metodología), ambos committed al repo. Para actualizar:

```bash
# Opción 1: Copiar desde el repo padre BMAD-S
cp -R /path/to/BMAD-S/_bmad/* ./_bmad/
npm run build

# Opción 2: Sync desde una ubicación externa
npm run sync-content -- --from /path/to/BMAD-S/_bmad
npm run build
```

El script `sync-content` transforma automáticamente todas las referencias a archivos locales (`{project-root}/_bmad/...`, `{installed_path}/...`, rutas relativas de steps) en llamadas a tools MCP.


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
│   ├── project/                 # Acceso al estado del proyecto (ELP, VRG, sprint)
│   │   ├── project-reader.ts    # Acceso filesystem a directorios del proyecto
│   │   ├── execution-log.ts     # Parse/write ELP (execution-log.yaml)
│   │   ├── artifact-scanner.ts  # Inventario VRG + recomendación de modo
│   │   └── sprint-reader.ts     # Estado del sprint + listado de stories
│   ├── tools/                   # 26 implementaciones de tools MCP
│   │   └── index.ts             # Orquestador de registro
│   ├── resources/               # 10 definiciones de resources MCP
│   │   └── index.ts
│   ├── prompts/                 # 8 prompts MCP predefinidos
│   │   └── index.ts
│   └── utils/
│       ├── content-transformer.ts # Reescribe refs _bmad/ → llamadas MCP
│       ├── csv-parser.ts        # Parser de module-help.csv
│       ├── yaml-parser.ts       # Parser de YAML de agentes
│       └── path-resolver.ts     # Traducción de rutas de contenido
├── _bmad/                       # Contenido BMAD-S raw (fuente, committed)
│   ├── core/                    # Tareas core, workflows y el agente maestro
│   ├── bmm/                     # Módulo principal: agentes, workflows, protocolos
│   └── utility/                 # Componentes de agente compartidos y templates
├── _docs/                       # Documentación de la metodología (committed)
│   ├── tutorials/               # Guías paso a paso
│   ├── how-to/                  # Guías prácticas
│   ├── explanation/             # Explicaciones conceptuales
│   ├── reference/               # Referencia técnica
│   └── bmgd/                    # BMAD Game Development
├── content/                     # Contenido MCP-ready (generado, en .gitignore)
│   ├── core/                    # Transformado desde _bmad/ via sync-content
│   ├── bmm/
│   ├── utility/
│   └── docs/                    # Transformado desde _docs/ via sync-content
├── scripts/
│   └── sync-content.ts          # _bmad/ → content/ con transformaciones MCP
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

**No.** Ese es precisamente el objetivo. El servidor MCP empaqueta todo el contenido BMAD-S y lo sirve bajo demanda. No necesitas el directorio `_bmad/` en tus proyectos.

### ¿Funciona offline?

**Sí**, cuando usas el transporte stdio (el default). Todo el contenido está empaquetado en el servidor — no se requiere internet.

### ¿Puedo usarlo con un proyecto que ya tiene `_bmad/` instalado?

**Sí.** Si existe un `_bmad/bmm/config.yaml` local, el servidor lo lee para configuraciones específicas del proyecto (como rutas de salida). Los tools MCP tienen prioridad para la entrega de contenido.

### ¿Cuál es la diferencia entre transporte stdio y HTTP?

- **stdio** (default) — El IDE lanza el servidor como subproceso. Rápido, funciona offline, sin configuración de red.
- **HTTP** — El servidor corre como servicio web. Útil para compartir con el equipo o acceso remoto desde múltiples máquinas.

### ¿Cómo actualizo el contenido BMAD-S?

Si ejecutas desde código fuente:
```bash
npm run sync-content   # Regenerar content/ desde _bmad/ y _docs/
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
