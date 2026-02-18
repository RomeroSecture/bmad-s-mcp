# Step 1: Initialization & Discovery

## Step 0: Secture Adaptation Gate (MANDATORY)

**STOP. Before scanning files or generating anything, execute the Secture Adaptation protocol.**

1. Check if `.cursor/mcp.json` exists in the project root
2. Check if any MCP servers are already referenced
3. Emit the **ENVIRONMENT INVENTORY** block from your `secture_adaptation`
4. Declare **EXECUTION MODE** (VERIFY / REFINE / GENERATE)

**Do NOT proceed until both blocks are printed and the user confirms with [C].**

---

## Step 1: Determine Required MCPs

Ask the user:

> {user_name}, ¿qué agentes vas a utilizar en este proyecto?

Present the following checklist:

| Agente | Función | MCP requerido |
|--------|---------|---------------|
| Milhouse (Git) | Gestión de repositorio | GitHub MCP Server |
| Wiggum (Deploy) — AWS | Despliegue en AWS | AWS MCP Server |
| Wiggum (Deploy) — Vercel | Despliegue en Vercel | Vercel MCP Server (planned) |
| Wiggum (Deploy) — Netlify | Despliegue en Netlify | Netlify MCP Server (planned) |

Based on the user's selection, build the **MCP SETUP PLAN**:

```
MCP SETUP PLAN:
- MCPs to configure: <list>
- MCPs already configured: <list or "none">
- MCPs not yet supported: <list or "none">
- Estimated setup time: <X minutes per MCP>
```

For any MCP marked as "planned" (not yet implemented), inform the user:

> Este proveedor aún no tiene workflow de configuración. Puedo generar la documentación de setup manual o puedes configurarlo tú directamente.

Present menu:
- **[C] Continue** — proceed to configure the first MCP in the plan
- **[A] Advanced** — discuss MCP requirements in more detail
