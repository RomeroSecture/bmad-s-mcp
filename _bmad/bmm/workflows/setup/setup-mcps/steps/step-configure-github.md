# Step: Configure GitHub MCP Server

## Prerequisites Check

Before starting, verify:
- Docker is installed (`docker --version` in terminal)
- User has a GitHub account with access to the target organization/repos

If Docker is NOT installed:
> Para usar el GitHub MCP Server necesitas Docker instalado. 
> Descárgalo de https://www.docker.com/products/docker-desktop/
> Una vez instalado, reinicia Cursor y vuelve a ejecutar este workflow.
> **[HALT]** — Cannot proceed without Docker.

---

## Part A: Create GitHub Personal Access Token

Guide the user step by step:

> {user_name}, necesito que crees un Personal Access Token en GitHub.
> Sigue estos pasos exactos:
>
> 1. Abre **https://github.com/settings/tokens?type=beta** en tu navegador
> 2. Click en **"Generate new token"**
> 3. Pon un nombre descriptivo: `BMAD-S MCP - {project_name}`
> 4. En **Expiration**, selecciona la duración que prefieras (recomendado: 90 días)
> 5. En **Repository access**, selecciona:
>    - "All repositories" si quieres acceso completo
>    - "Only select repositories" si prefieres limitar el acceso
> 6. En **Permissions**, activa estos permisos:
>    - **Repository permissions:**
>      - Contents: Read and write
>      - Issues: Read and write
>      - Pull requests: Read and write
>      - Metadata: Read-only (se activa solo)
>      - Actions: Read-only (para monitorizar CI/CD)
>    - **Organization permissions** (si aplica):
>      - Members: Read-only
> 7. Click en **"Generate token"**
> 8. **COPIA EL TOKEN AHORA** — no lo podrás ver de nuevo
>
> Cuando lo tengas, pégamelo aquí. Lo usaré para generar la configuración
> y luego puedes borrarlo de este chat.

**Wait for user to provide the token.**

⚠️ **IMPORTANT:** Do NOT store the token in any file that could be committed to git. 
It will ONLY go in `.cursor/mcp.json` which should be in `.gitignore`.

---

## Part B: Generate Configuration

Once the token is provided, generate the MCP configuration block:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<USER_TOKEN_HERE>"
      }
    }
  }
}
```

Actions:
1. Check if `.cursor/mcp.json` already exists
2. If YES: merge the `github` entry into existing configuration
3. If NO: create the file with the github configuration
4. Verify `.gitignore` includes `.cursor/mcp.json` — if not, add it

Show the user the generated file and ask for confirmation before writing.

---

## Part C: Verify Connectivity

> Reinicia Cursor (cierra y abre la aplicación) para que cargue la nueva configuración MCP.
> Cuando hayas reiniciado, dime [C] y verificaré que el GitHub MCP responde.

After user confirms restart:
1. Attempt to use a GitHub MCP tool (e.g., list repositories)
2. If successful:
   ```
   ✅ GitHub MCP Server: CONNECTED
      - Authentication: Valid
      - Docker container: Running
      - Available tools: create_repository, create_branch, create_pull_request, ...
   ```
3. If failed:
   ```
   ❌ GitHub MCP Server: FAILED
      - Error: <error message>
      - Possible causes:
        - Docker not running → Open Docker Desktop
        - Token invalid → Regenerate at https://github.com/settings/tokens
        - Network issue → Check internet connection
   ```
   Offer to retry or skip.

---

## Completion

```
GitHub MCP: ✅ CONFIGURED AND VERIFIED
Token expires: <date if known>
Reminder: Renueva el token antes de que expire.
```

Present menu:
- **[C] Continue** — proceed to next MCP in setup plan
- **[S] Skip** — skip to next MCP (mark GitHub as "configured but unverified")
