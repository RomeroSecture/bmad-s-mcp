# BMAD MCP Server

## Project Overview

MCP (Model Context Protocol) server that serves BMAD Method content (agents, workflows, templates, data) to any AI-powered IDE (Claude Code, Cursor, Windsurf). Acts as a **content server** — the LLM remains the execution engine.

## Tech Stack

- **Runtime**: Node.js 20+ / TypeScript 5.8
- **MCP SDK**: `@modelcontextprotocol/sdk` (stdio + StreamableHTTP transports)
- **Validation**: Zod schemas
- **Parsers**: js-yaml, csv-parse
- **HTTP**: Express 5 (for remote/HTTP transport)
- **Tests**: Vitest

## Project Structure

```
bmad-mcp/
├── src/
│   ├── index.ts                 # Entry point — selects transport (stdio/http)
│   ├── server.ts                # Creates McpServer, registers tools + resources
│   ├── transport/
│   │   ├── stdio.ts             # StdioServerTransport
│   │   └── http.ts              # Express + StreamableHTTP
│   ├── config/
│   │   ├── schema.ts            # Zod schemas for BmadConfig
│   │   ├── loader.ts            # Env vars → local config → defaults
│   │   └── variables.ts         # BMAD variable resolution ({project-root}, {{date}}, etc.)
│   ├── content/
│   │   ├── registry.ts          # In-memory index of all bundled content (262 files)
│   │   └── reader.ts            # File reader with path resolution
│   ├── tools/                   # 15 MCP tools (list-*, get-*, search, help)
│   │   └── index.ts             # Tool registration orchestrator
│   ├── resources/
│   │   └── index.ts             # 5 MCP resources (bmad://*)
│   └── utils/
│       ├── content-transformer.ts # Rewrites _bmad/ file refs → MCP tool calls
│       ├── csv-parser.ts        # Parses module-help.csv → WorkflowEntry[]
│       ├── yaml-parser.ts       # Parses agent YAML → AgentDefinition
│       └── path-resolver.ts     # Content root + _bmad/ path translation
├── content/                     # Bundled _bmad/ content (synced from parent repo)
│   ├── core/
│   ├── bmm/
│   └── utility/
├── scripts/
│   └── sync-content.ts          # Copies _bmad/{core,bmm,utility} → content/
└── test/
```

## Commands

```bash
npm run build          # TypeScript compile → dist/
npm run dev            # Run with tsx (hot reload)
npm start              # Run compiled dist/index.js
npm run sync-content   # Sync _bmad/ content from parent BMAD-S repo
npm test               # Run vitest
```

## Key Architecture Decisions

- **Content is bundled statically** in `content/` — 262 files, ~2.1 MB. No network dependency at runtime.
- **ContentRegistry** indexes all files at startup into an in-memory Map for fast lookup.
- **Content Transformer** automatically rewrites `_bmad/` file references into MCP tool calls when serving content.
- **15 granular tools** (not few large ones) — LLMs work better with small, focused tool schemas.
- **Stateless server** — the LLM manages conversational state; BMAD manages document state via frontmatter.
- **Config resolution order**: env vars > local project config (`_bmad/bmm/config.yaml`) > Zod defaults.

## Content Transformer (`src/utils/content-transformer.ts`)

All content delivered by `get-*` tools passes through `transformContent()` which rewrites local file references into MCP tool calls. This is what makes the MCP server a drop-in replacement for per-project `_bmad/` installation.

**Patterns handled:**
1. `{project-root}/_bmad/...` → classifies path and maps to appropriate `bmad_get_*` tool
2. `{installed_path}/...` → resolves relative to the current workflow dir
3. Relative step paths (`./steps/step-02.md`) → `bmad_get_step` with resolved workflow_path
4. `Read fully and follow:` / `Load step:` directives → replaces the path with tool call
5. Manifest CSV references (`agent-manifest.csv`, etc.) → `bmad_list_agents`, `bmad_list_workflows`
6. Frontmatter refs (`nextStepFile`, `prdTemplate`) → adds YAML comment with tool hint

**Important:** Tools that parse content internally (`list-agents`, `list-workflows`, `bmad-help`, `search-content`) use `reader.readRaw()` to get untransformed content. Only user-facing content delivery uses `reader.readAbsolute(path, relativePath)` to trigger transformation.

## Tools (15)

| Tool | Purpose |
|------|---------|
| `bmad_list_agents` | List agents with metadata and menu codes |
| `bmad_get_agent` | Full YAML definition of an agent (fuzzy name match) |
| `bmad_list_workflows` | Workflow catalog from module-help.csv |
| `bmad_get_workflow` | Workflow content by code ("CP") or path |
| `bmad_get_step` | Step file from a workflow's steps directory |
| `bmad_get_template` | Template file with placeholders intact |
| `bmad_get_data` | Data/CSV/reference files |
| `bmad_get_task` | Task definitions (workflow.xml engine, help.md) |
| `bmad_get_config` | Resolved BMAD configuration |
| `bmad_help` | Routing guidance — next workflow recommendations |
| `bmad_get_protocol` | Protocol files (ELP, etc.) |
| `bmad_list_templates` | Available templates with paths |
| `bmad_list_data` | Available data files by category |
| `bmad_get_checklist` | Validation checklist for a workflow |
| `bmad_search_content` | Full-text search across all content |

## Resources (5)

| URI | Content |
|-----|---------|
| `bmad://config` | Resolved configuration (YAML) |
| `bmad://catalog/workflows` | Combined workflow catalog (JSON) |
| `bmad://catalog/agents` | Agent roster with metadata (JSON) |
| `bmad://docs/overview` | Compiled BMAD Method overview (Markdown) |
| `bmad://core/workflow-engine` | workflow.xml execution engine (XML) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BMAD_PROJECT_NAME` | directory name | Project name |
| `BMAD_USER_NAME` | `"BMad"` | User display name |
| `BMAD_LANG` | `"English"` | Communication language |
| `BMAD_DOC_LANG` | `"English"` | Document output language |
| `BMAD_SKILL_LEVEL` | `"intermediate"` | beginner / intermediate / expert |
| `BMAD_OUTPUT_FOLDER` | `"_bmad-output"` | Output folder name |
| `BMAD_TRANSPORT` | `"stdio"` | `stdio` or `http` |
| `BMAD_HTTP_PORT` | `3000` | HTTP port (when transport=http) |

## Content Sync

Content comes from the parent BMAD-S repo's `_bmad/` directory. To update:

```bash
npm run sync-content
npm run build
```

This copies `_bmad/{core,bmm,utility}` into `content/`, excluding `_module-installer/` directories.

## Testing with MCP Inspector

```bash
# Stdio
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js

# HTTP
BMAD_TRANSPORT=http node dist/index.js
curl http://localhost:3000/health
```

## Deployment

- **Local (stdio)**: `npx bmad-mcp` or add to IDE MCP config
- **Remote (HTTP)**: Docker → murder-of-crows via Traefik at `bmad.romerolabs.dev`
- **Traefik entrypoints**: `https` (not `websecure`)
