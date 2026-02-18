# BMAD MCP Server

> The entire BMAD Method in your IDE, zero installation per project.

**bmad-mcp** is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that gives any AI-powered IDE instant access to the full **BMAD Method** — 13 specialized agents, 38 workflows, templates, data references, and the workflow execution engine — without copying files into every project.

---

## Table of Contents

- [What is BMAD?](#what-is-bmad)
- [What is an MCP Server?](#what-is-an-mcp-server)
- [Why bmad-mcp?](#why-bmad-mcp)
- [Quick Start](#quick-start)
- [Platform Setup](#platform-setup)
  - [Claude Code](#claude-code)
  - [Cursor](#cursor)
  - [Windsurf](#windsurf)
  - [VS Code (Copilot)](#vs-code-copilot)
  - [Remote Server (HTTP)](#remote-server-http)
- [Configuration](#configuration)
- [Available Tools (15)](#available-tools-15)
- [Available Resources (5)](#available-resources-5)
- [Agents](#agents)
- [Workflows](#workflows)
- [How It Works](#how-it-works)
- [Usage Examples](#usage-examples)
- [Self-Hosting](#self-hosting)
- [Development](#development)
- [Architecture](#architecture)
- [FAQ](#faq)
- [License](#license)

---

## What is BMAD?

**BMAD** (Breakthrough Method of Agile AI-driven Development) is a comprehensive framework for AI-assisted software development. It provides:

- **13 specialized AI agents** — each with a unique persona, expertise, and set of workflows
- **38 structured workflows** — covering the full software development lifecycle from brainstorming to deployment
- **4 development phases** — Analysis, Planning, Solutioning, and Implementation
- **Templates, checklists, and data references** — for consistent, high-quality output
- **A workflow execution engine** — that guides the AI step-by-step through complex multi-step processes

Think of it as a complete "operating system" for AI-driven development, where each agent is a specialist team member (Product Manager, Architect, Developer, QA, etc.) and each workflow is a proven process they follow.

---

## What is an MCP Server?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard created by Anthropic that lets AI assistants connect to external data sources and tools. An MCP server exposes:

- **Tools** — Functions the AI can call (like `bmad_list_workflows` or `bmad_get_agent`)
- **Resources** — Static data the AI can read (like the workflow catalog or method overview)

When you add an MCP server to your IDE, the AI gains new capabilities. In this case, it gains access to the entire BMAD methodology.

---

## Why bmad-mcp?

### Before: Per-project installation

```bash
# Had to do this for EVERY project
npx bmad-method install
# Creates _bmad/ directory with 260+ files in your project
```

### After: One global config

```jsonc
// Add once to your IDE settings — works everywhere
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"]
    }
  }
}
```

### Key advantages

| | Per-project install | MCP Server |
|---|---|---|
| **Setup** | `npx install` per project | One-time global config |
| **Files in your repo** | 260+ files in `_bmad/` | Zero |
| **Updates** | Reinstall per project | Update once globally |
| **Works across IDEs** | Claude Code only | Claude Code, Cursor, Windsurf, VS Code |
| **Team sharing** | Each member installs | Share one remote server |
| **Content access** | File reads (slow) | Indexed in memory (fast) |
| **Search** | Manual file navigation | `bmad_search_content` across all files |

---

## Quick Start

### Option 1: npx (recommended)

No installation needed. Just add to your IDE config:

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

### Option 2: Global install

```bash
npm install -g bmad-mcp
```

### Option 3: From source

```bash
git clone https://github.com/bmad-code-org/bmad-mcp.git
cd bmad-mcp
npm install
npm run build
```

---

## Platform Setup

### Claude Code

Add to `~/.claude/settings.json` (global) or `.claude/settings.json` (per-project):

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"],
      "env": {
        "BMAD_USER_NAME": "YourName",
        "BMAD_LANG": "English",
        "BMAD_SKILL_LEVEL": "expert"
      }
    }
  }
}
```

Restart Claude Code. The 15 BMAD tools will appear automatically.

### Cursor

Add to `.cursor/mcp.json` in your project or global config:

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"],
      "env": {
        "BMAD_USER_NAME": "YourName",
        "BMAD_LANG": "English"
      }
    }
  }
}
```

### Windsurf

Add to Windsurf's MCP configuration:

```json
{
  "mcpServers": {
    "bmad": {
      "command": "npx",
      "args": ["-y", "bmad-mcp"],
      "env": {
        "BMAD_USER_NAME": "YourName"
      }
    }
  }
}
```

### VS Code (Copilot)

Add to VS Code's `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "bmad": {
        "command": "npx",
        "args": ["-y", "bmad-mcp"],
        "env": {
          "BMAD_USER_NAME": "YourName"
        }
      }
    }
  }
}
```

### Remote Server (HTTP)

For team-wide access, deploy once and connect from any IDE:

```json
{
  "mcpServers": {
    "bmad": {
      "url": "https://your-server.example.com/mcp"
    }
  }
}
```

See [Self-Hosting](#self-hosting) for deployment instructions.

---

## Configuration

### Environment Variables

Customize BMAD behavior by setting environment variables in your MCP config:

| Variable | Default | Description |
|----------|---------|-------------|
| `BMAD_USER_NAME` | `"BMad"` | How agents address you |
| `BMAD_LANG` | `"English"` | Language for agent communication |
| `BMAD_DOC_LANG` | `"English"` | Language for generated documents |
| `BMAD_SKILL_LEVEL` | `"intermediate"` | `beginner` / `intermediate` / `expert` — adjusts verbosity |
| `BMAD_PROJECT_NAME` | directory name | Your project name |
| `BMAD_OUTPUT_FOLDER` | `"_bmad-output"` | Where workflows save output files |
| `BMAD_TRANSPORT` | `"stdio"` | `stdio` (local) or `http` (remote) |
| `BMAD_HTTP_PORT` | `3000` | Port for HTTP transport |

### Configuration Priority

Settings are resolved in this order (first wins):

1. **Environment variables** — set in your MCP config
2. **Local project config** — `{project}/_bmad/bmm/config.yaml` (if it exists)
3. **Defaults** — built-in sensible defaults

This means you can set global preferences via env vars and override per-project if needed.

---

## Available Tools (15)

### Discovery Tools

| Tool | Description | Example Input |
|------|-------------|---------------|
| `bmad_list_agents` | List all agents with roles, icons, and workflow codes | `{ "module": "bmm" }` |
| `bmad_list_workflows` | Browse the complete workflow catalog | `{ "phase": "2-planning" }` |
| `bmad_list_templates` | List available document templates | `{ "module": "bmm" }` |
| `bmad_list_data` | List data files, protocols, references | `{ "category": "all" }` |
| `bmad_help` | Smart routing — recommends the next workflow | `{ "context": "PRD is done" }` |

### Content Delivery Tools

| Tool | Description | Example Input |
|------|-------------|---------------|
| `bmad_get_agent` | Load a complete agent definition (persona, role, menu) | `{ "agent_id": "architect" }` |
| `bmad_get_workflow` | Load a workflow by code or path | `{ "workflow_code": "CP" }` |
| `bmad_get_step` | Load a specific step from a workflow | `{ "workflow_path": "bmm/workflows/2-plan-workflows/create-prd", "step_file": "step-01-init.md" }` |
| `bmad_get_template` | Load a document template with placeholders | `{ "template_path": "bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md" }` |
| `bmad_get_data` | Load a data/reference file | `{ "data_path": "bmm/data/project-context-template.md" }` |
| `bmad_get_task` | Load a task engine (workflow.xml, help.md) | `{ "task_name": "workflow" }` |
| `bmad_get_protocol` | Load a protocol definition | `{ "protocol_name": "ELP" }` |
| `bmad_get_config` | View the resolved configuration | `{}` |

### Advanced Tools

| Tool | Description | Example Input |
|------|-------------|---------------|
| `bmad_get_checklist` | Get validation checklist for a workflow | `{ "workflow_path": "bmm/workflows/4-implementation/code-review/workflow.yaml" }` |
| `bmad_search_content` | Full-text search across all BMAD content | `{ "query": "sprint planning", "file_types": ["md", "yaml"] }` |

---

## Available Resources (5)

MCP resources are static data that the AI can read on demand:

| Resource URI | Description |
|---|---|
| `bmad://config` | Current resolved configuration (YAML) |
| `bmad://catalog/workflows` | Complete workflow catalog with metadata (JSON) |
| `bmad://catalog/agents` | Full agent roster with roles and capabilities (JSON) |
| `bmad://docs/overview` | Compiled overview of the BMAD Method (Markdown) |
| `bmad://core/workflow-engine` | The `workflow.xml` engine for executing YAML workflows (XML) |

---

## Agents

BMAD includes 13 specialized agents, each with a unique personality, expertise, and set of workflows:

| Icon | Name | Role | Key Workflows |
|------|------|------|---------------|
| 📊 | **Monty** | Business Analyst | Brainstorm, Research, Create Brief |
| 📋 | **Lisa** | Product Manager | Create/Validate/Edit PRD, Epics & Stories |
| 🎨 | **Marge** | UX Designer | Create UX Design |
| 🏗️ | **Frink** | Architect | Create Architecture, Implementation Readiness |
| 🏃 | **Ned** | Scrum Master | Sprint Planning, Create Story, Retrospective |
| 💻 | **Homer** | Developer | Dev Story, Code Review |
| 🧪 | **Edna** | QA Engineer | QA Automation Tests |
| 🚀 | **Bart** | Quick Flow Solo Dev | Quick Spec, Quick Dev |
| 📚 | **Kent** | Technical Writer | Write Document, Mermaid Diagrams, Explain Concepts |
| 🗂️ | **Milhouse** | Git & Repository | Configure Repo, Manage PRs |
| 🚀 | **Wiggum** | Deploy & CI/CD | Deploy Configure, Deploy Execute |
| 🔧 | **Smithers** | Setup & Onboarding | Setup Project, Setup MCPs |
| 🧙 | **BMad Master** | Master Orchestrator | Cross-agent coordination, Knowledge Custodian |

To load an agent, use:
```
bmad_get_agent({ "agent_id": "architect" })
```

---

## Workflows

### Lifecycle Phases

BMAD organizes development into 4 sequential phases plus anytime utilities:

```
  Anytime Tools (available at any phase)
         │
    ┌────┴────┐
    ▼         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Analysis    │────▶│  2. Planning     │────▶│  3. Solutioning │────▶│  4. Implementation│
│                 │     │                  │     │                 │     │                   │
│  Brainstorm     │     │  Create PRD ★    │     │  Architecture ★ │     │  Sprint Plan ★    │
│  Market Research│     │  Validate PRD    │     │  Epics/Stories ★│     │  Create Story ★   │
│  Domain Research│     │  Edit PRD        │     │  Readiness ★    │     │  Dev Story ★      │
│  Tech Research  │     │  Create UX       │     │                 │     │  Code Review      │
│  Create Brief   │     │                  │     │                 │     │  QA Tests         │
│                 │     │                  │     │                 │     │  Retrospective    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                          ★ = required
```

### Anytime Tools

These work at any phase and don't require phase progression:

| Code | Workflow | Agent | Description |
|------|----------|-------|-------------|
| QS | Quick Spec | Bart | Fast spec for simple tasks without full BMAD planning |
| QD | Quick Dev | Bart | Quick implementation for one-off tasks |
| DP | Document Project | Monty | Analyze existing project to produce documentation |
| GPC | Generate Project Context | Monty | Scan codebase for an LLM-optimized project context file |
| CC | Correct Course | Ned | Navigate significant changes mid-project |
| WD | Write Document | Kent | Create documentation following best practices |
| MG | Mermaid Generate | Kent | Create Mermaid diagrams |
| VD | Validate Document | Kent | Review documents against standards |
| EC | Explain Concept | Kent | Create technical explanations with examples |
| PM | Party Mode | - | Multi-agent discussion orchestration |
| BH | bmad-help | - | Smart routing to the next recommended workflow |

### Phase 1: Analysis

| Code | Workflow | Description |
|------|----------|-------------|
| BP | Brainstorm Project | Guided facilitation through brainstorming techniques |
| MR | Market Research | Market analysis, competitive landscape, customer needs |
| DR | Domain Research | Industry deep dive, subject matter expertise |
| TR | Technical Research | Technical feasibility, architecture options |
| CB | Create Brief | Guided experience to nail down your product idea |

### Phase 2: Planning

| Code | Workflow | Required | Description |
|------|----------|----------|-------------|
| CP | Create PRD | **Yes** | Expert-led facilitation for Product Requirements Document |
| VP | Validate PRD | No | Validate PRD is comprehensive and cohesive |
| EP | Edit PRD | No | Improve and enhance an existing PRD |
| CU | Create UX | No | Guided UX design workflow |

### Phase 3: Solutioning

| Code | Workflow | Required | Description |
|------|----------|----------|-------------|
| CA | Create Architecture | **Yes** | Guided workflow to document technical decisions |
| CE | Create Epics & Stories | **Yes** | Create the full epics and stories listing |
| IR | Check Implementation Readiness | **Yes** | Ensure PRD, UX, Architecture, and Stories are aligned |

### Phase 4: Implementation

| Code | Workflow | Required | Description |
|------|----------|----------|-------------|
| SP | Sprint Planning | **Yes** | Generate sprint plan to kick off implementation |
| CS | Create Story | **Yes** | Prepare the next story for development |
| DS | Dev Story | **Yes** | Execute story implementation and tests |
| CR | Code Review | No | Review code, route back to DS or next story |
| QA | QA Automation Test | No | Generate automated tests for implemented code |
| SS | Sprint Status | No | Summarize sprint progress and route next |
| ER | Retrospective | No | Review completed work and lessons learned |

---

## How It Works

### Architecture

```
Your IDE (Claude Code / Cursor / Windsurf / VS Code)
     │
     │  MCP Protocol
     ▼
┌─────────────────────────────────────┐
│  bmad-mcp server                    │
│                                     │
│  ContentRegistry (262 files indexed)│
│  ├── core/    (tasks, workflows)    │
│  ├── bmm/     (agents, workflows)   │
│  └── utility/ (templates)           │
│                                     │
│  15 Tools + 5 Resources             │
└─────────────────────────────────────┘
```

### The Flow

1. **You ask the AI** something like "I want to create a PRD for my project"
2. **The AI calls** `bmad_list_workflows` or `bmad_help` to find the right workflow
3. **The AI calls** `bmad_get_agent({ "agent_id": "pm" })` to load Lisa, the Product Manager
4. **The AI calls** `bmad_get_workflow({ "workflow_code": "CP" })` to load the Create PRD workflow
5. **The AI follows** the workflow steps, calling `bmad_get_step` for each step
6. **The AI uses** templates via `bmad_get_template` to structure the output
7. **You get** a professional PRD created through expert-guided facilitation

The MCP server is a **content server** — it serves the methodology content. The AI in your IDE is the **execution engine** — it reads the content and follows the instructions, just as it would with local files.

### Key Design Decisions

- **Content is bundled** — All 262 BMAD files (2.1 MB) are included in the server. No network calls to fetch content at runtime.
- **Indexed at startup** — Every file is categorized and indexed into an in-memory registry for sub-millisecond lookups.
- **Stateless** — The server has no session state. The AI manages conversational context; BMAD manages document state via output files.
- **Granular tools** — 15 small, focused tools instead of few large ones. LLMs work better with specific tool schemas.

---

## Usage Examples

### Starting a new project from scratch

```
You: "I want to build a task management app. Help me use BMAD to plan it."

AI calls: bmad_help({ "context": "new project, no artifacts yet" })
AI calls: bmad_get_agent({ "agent_id": "analyst" })
AI calls: bmad_get_workflow({ "workflow_code": "BP" })
→ Starts guided brainstorming session as Monty the Analyst
```

### Creating a PRD

```
You: "Let's create the PRD"

AI calls: bmad_get_agent({ "agent_id": "pm" })
AI calls: bmad_get_workflow({ "workflow_code": "CP" })
AI calls: bmad_get_step({ "workflow_path": "bmm/workflows/2-plan-workflows/create-prd", "step_file": "step-01-init.md", "steps_dir": "steps-c" })
→ Lisa guides you through 12 steps to create a comprehensive PRD
```

### Quick one-off task

```
You: "I just need to add a login page, nothing fancy"

AI calls: bmad_get_agent({ "agent_id": "quick-flow-solo-dev" })
AI calls: bmad_get_workflow({ "workflow_code": "QD" })
→ Bart does a quick implementation without full BMAD planning
```

### Finding what to do next

```
You: "What should I do after architecture is done?"

AI calls: bmad_help({ "context": "architecture completed" })
→ Recommends: Create Epics & Stories [CE] (required), then Implementation Readiness [IR]
```

### Searching for content

```
You: "Find me everything about sprint planning"

AI calls: bmad_search_content({ "query": "sprint planning", "file_types": ["md", "yaml"] })
→ Returns matching files with line-level context
```

---

## Self-Hosting

### Docker (for team/remote access)

Build and run with Docker:

```bash
docker build -t bmad-mcp .
docker run -d \
  -p 3000:3000 \
  -e BMAD_TRANSPORT=http \
  --name bmad-mcp \
  bmad-mcp
```

### Docker Compose with Traefik

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
      - traefik.http.routers.bmad-mcp.rule=Host(`bmad.yourdomain.com`)
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
curl https://bmad.yourdomain.com/health
# {"status":"ok","server":"bmad-mcp"}
```

### Team Configuration

Once deployed, every team member adds one line to their IDE:

```json
{
  "mcpServers": {
    "bmad": {
      "url": "https://bmad.yourdomain.com/mcp"
    }
  }
}
```

---

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/bmad-code-org/bmad-mcp.git
cd bmad-mcp
npm install
npm run sync-content   # Copy BMAD content from parent repo
npm run build
```

### Commands

```bash
npm run build          # Compile TypeScript → dist/
npm run dev            # Run with hot reload (tsx)
npm start              # Run compiled server
npm run sync-content   # Re-sync content from BMAD-S repo
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
```

### Testing locally

```bash
# Test stdio transport
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js

# Test HTTP transport
BMAD_TRANSPORT=http node dist/index.js
curl http://localhost:3000/health
```

---

## Architecture

### Project Structure

```
bmad-mcp/
├── src/
│   ├── index.ts                 # Entry point — selects stdio or http transport
│   ├── server.ts                # Creates McpServer, registers tools + resources
│   ├── transport/
│   │   ├── stdio.ts             # Local stdio transport (default)
│   │   └── http.ts              # Remote HTTP transport (Express + StreamableHTTP)
│   ├── config/
│   │   ├── schema.ts            # Zod validation schemas
│   │   ├── loader.ts            # Config resolution (env → local → defaults)
│   │   └── variables.ts         # BMAD variable engine ({project-root}, {{date}}, etc.)
│   ├── content/
│   │   ├── registry.ts          # In-memory file index (built at startup)
│   │   └── reader.ts            # File reader with path resolution
│   ├── tools/                   # 15 MCP tool implementations
│   │   └── index.ts             # Registration orchestrator
│   ├── resources/               # 5 MCP resource definitions
│   │   └── index.ts
│   └── utils/
│       ├── csv-parser.ts        # module-help.csv parser
│       ├── yaml-parser.ts       # Agent YAML parser
│       └── path-resolver.ts     # Content path translation
├── content/                     # Bundled BMAD content (262 files, ~2.1 MB)
│   ├── core/                    # Core tasks, workflows, and the master agent
│   ├── bmm/                     # Main module: agents, workflows, protocols
│   └── utility/                 # Shared agent components and templates
├── scripts/
│   └── sync-content.ts          # Syncs _bmad/ from BMAD-S repo
├── Dockerfile                   # Multi-stage build for production
├── docker-compose.prod.yml      # Traefik-ready deployment config
└── test/                        # Vitest test suites
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.8 |
| MCP SDK | `@modelcontextprotocol/sdk` 1.12+ |
| Validation | Zod 3.25+ |
| YAML parsing | js-yaml 4.1 |
| CSV parsing | csv-parse 6.1 |
| HTTP server | Express 5.1 |
| Tests | Vitest 3.2 |

---

## FAQ

### Do I still need to install BMAD per project?

**No.** That's the whole point. The MCP server bundles all BMAD content and serves it on demand. No `_bmad/` directory needed in your projects.

### Does it work offline?

**Yes**, when using stdio transport (the default). All content is bundled in the server — no internet required.

### Can I use it with a project that already has `_bmad/` installed?

**Yes.** If a local `_bmad/bmm/config.yaml` exists, the server reads it for project-specific settings (like output paths). The MCP tools take priority for content delivery.

### What's the difference between stdio and HTTP transport?

- **stdio** (default) — The IDE launches the server as a subprocess. Fast, works offline, no network setup.
- **HTTP** — The server runs as a web service. Useful for team sharing or remote access from multiple machines.

### How do I update the BMAD content?

If running from source:
```bash
npm run sync-content   # Pull latest from BMAD-S repo
npm run build          # Rebuild
```

If using npx, the content updates when a new version is published.

### Can I customize agent behavior?

Yes, via environment variables:
- `BMAD_SKILL_LEVEL` adjusts verbosity (beginner gets more explanation, expert gets concise output)
- `BMAD_LANG` sets the communication language
- `BMAD_DOC_LANG` sets the document output language

### How do I know which workflow to use?

Call `bmad_help` — it analyzes your project state and recommends the next workflow based on phase progression and completed artifacts.

### Can my whole team use one server?

**Yes.** Deploy via Docker with HTTP transport, and every team member connects with a one-line URL config. The server is stateless, so it handles concurrent users naturally.

---

## License

MIT
