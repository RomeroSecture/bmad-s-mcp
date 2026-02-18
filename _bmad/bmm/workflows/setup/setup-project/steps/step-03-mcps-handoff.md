# Step 3: MCP Setup Decision

## Ask About DevOps Needs

> {user_name}, tu proyecto ya está configurado para trabajar con los agentes de planificación
> e implementación (Lisa, Marge, Frink, Homer, Edna, Ned, Bart, Kent).
>
> Los agentes de DevOps (Milhouse para Git, Wiggum para Deploy) necesitan MCPs configurados.
> ¿Quieres configurarlos ahora?

| Opción | Qué incluye |
|--------|-------------|
| **[1] Sí, configurar MCPs** | Lanza el workflow SM (Setup MCPs) ahora |
| **[2] Solo Git (GitHub)** | Configura solo el GitHub MCP para Milhouse |
| **[3] No, más adelante** | Termina el onboarding aquí |

---

## Option 1 or 2: Launch SM workflow

> Perfecto. Voy a lanzar el workflow de configuración de MCPs.

**Hand off to the setup-mcps workflow:**
Load and execute `{project-root}/_bmad/bmm/workflows/setup/setup-mcps/workflow.yaml`

If Option 2: Pre-select only GitHub MCP in the setup plan (skip AWS/Vercel/Netlify questions).

---

## Option 3: Complete Without MCPs

Generate the final onboarding summary:

```
╔══════════════════════════════════════════════════╗
║          PROJECT ONBOARDING COMPLETE             ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Project: {project_name}                         ║
║  User: {user_name}                               ║
║  Language: {communication_language}               ║
║  Skill level: {user_skill_level}                 ║
║                                                  ║
║  READY TO USE                                    ║
║  ├── Lisa (PM):       ✅  "Lisa, CP"             ║
║  ├── Marge (UX):      ✅  "Marge, CU"            ║
║  ├── Frink (Arch):    ✅  "Frink, CA"            ║
║  ├── Homer (Dev):     ✅  "Homer, DS"            ║
║  ├── Edna (QA):       ✅  "Edna, QA"             ║
║  ├── Ned (SM):        ✅  "Ned, SP"              ║
║  ├── Monty (Analyst): ✅  "Monty, BP"            ║
║  ├── Bart (Quick):    ✅  "Bart, QS"             ║
║  └── Kent (Writer):   ✅  "Kent, DP"             ║
║                                                  ║
║  NEED MCP SETUP                                  ║
║  ├── Milhouse (Git):  ⏸️  "Smithers, SM" primero ║
║  └── Wiggum (Deploy): ⏸️  "Smithers, SM" primero ║
║                                                  ║
║  QUICK START                                     ║
║  → Proyecto nuevo:     "Lisa, CP"                ║
║  → Proyecto rápido:    "Bart, QS"                ║
║  → Proyecto existente: "Kent, DP"                ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

> **Abre una conversación nueva en Cursor** para que las rules y la config
> se carguen desde el inicio. Luego activa el primer agente que necesites.
