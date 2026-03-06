# Step: Final Verification & Summary

## Full Environment Check

Run a complete verification of all configured MCPs:

```
╔══════════════════════════════════════════════════╗
║          BMAD-S ENVIRONMENT STATUS               ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Project: {project_name}                         ║
║  User: {user_name}                               ║
║  IDE: Claude Code                                     ║
║                                                  ║
║  CORE CONFIGURATION                              ║
║  ├── config.yaml:     [✅ | ❌]                  ║
║  ├── CLAUDE.md:        [✅ | ❌]                  ║
║  └── .gitignore:      [✅ | ❌] (mcp.json)      ║
║                                                  ║
║  MCP SERVERS                                     ║
║  ├── GitHub:          [✅ | ❌ | ⏭ SKIPPED]     ║
║  ├── AWS:             [✅ | ❌ | ⏭ SKIPPED]     ║
║  ├── Vercel:          [🔲 PLANNED]               ║
║  └── Netlify:         [🔲 PLANNED]               ║
║                                                  ║
║  AGENT READINESS                                 ║
║  ├── Lisa (PM):       ✅ Ready (no MCP needed)   ║
║  ├── Marge (UX):      ✅ Ready (no MCP needed)   ║
║  ├── Frink (Arch):    ✅ Ready (no MCP needed)   ║
║  ├── Homer (Dev):     ✅ Ready (no MCP needed)   ║
║  ├── Edna (QA):       ✅ Ready (no MCP needed)   ║
║  ├── Ned (SM):        ✅ Ready (no MCP needed)   ║
║  ├── Monty (Analyst): ✅ Ready (no MCP needed)   ║
║  ├── Bart (Quick):    ✅ Ready (no MCP needed)   ║
║  ├── Kent (Writer):   ✅ Ready (no MCP needed)   ║
║  ├── Milhouse (Git):  [✅ | ❌] Requires GitHub  ║
║  └── Wiggum (Deploy): [✅ | ❌] Requires AWS/... ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

## Generated Files

List all files created or modified during this setup:

```
FILES GENERATED/MODIFIED:
- .mcp.json          [CREATED | UPDATED]
- .gitignore                [UPDATED — added mcp.json exclusion]
```

## Security Reminders

> ⚠️ **Recordatorios de seguridad:**
> - NUNCA subas `.mcp.json` al repositorio — contiene tokens
> - Los tokens de GitHub expiran en <X días> — renuévalos antes
> - Las credenciales AWS deben rotarse según la política de tu empresa
> - Si un token se compromete, revócalo inmediatamente en la consola correspondiente

## Next Steps

Based on what was configured, suggest next actions:

> **Tu entorno está listo. Próximos pasos recomendados:**
>
> 1. **Abre una nueva sesión de Claude Code** (las rules y MCPs se cargan al inicio)
> 2. Activa el primer agente que necesites:
>    - Para planificación: "Lisa, CP" (crear PRD)
>    - Para repositorio: "Milhouse, CR" (configurar repo)
>    - Para proyecto rápido: "Bart, QS" (quick spec)

## Completion

Present menu:
- **[V] Verify again** — re-run connectivity checks for all MCPs
- **[E] Export** — generate a setup report in `docs/project/environment-setup.md`
- **[X] Exit** — setup complete
