# Step 1: Generate Project Dashboard

## Data Collection

Read ALL available data sources. For each, note if present or absent:

1. **Execution Log** (`_bmad-output/execution-log.yaml`)
   - Parse all entries
   - Count closing entries by result: SUCCESS, PARTIAL, FAILED, HALTED
   - Count by agent
   - Identify most recent entry per agent
   - **Detect orphans**: Find STARTED entries whose `id` does NOT appear
     in any subsequent closing entry (SUCCESS/PARTIAL/FAILED/HALTED).
     These are interrupted executions.
   - Extract all unresolved errors (FAILED/PARTIAL without a subsequent
     SUCCESS for same agent+workflow)

2. **Sprint Status** (`_bmad-output/implementation-artifacts/sprint-status.yaml`)
   - Current sprint number and dates
   - Story statuses: ready-for-dev, in-progress, complete, blocked
   - Calculate velocity if multiple sprints exist

3. **Repository Setup** (`docs/project/repository-setup.md`)
   - Repository URL, branch strategy
   - Last known state

4. **Deployment Setup** (`docs/project/deployment-setup.md`)
   - Platform, environments configured
   - Last known deploy state

5. **Planning Artifacts** (scan `_bmad-output/planning-artifacts/`)
   - PRD: exists? completeness?
   - Architecture: exists?
   - UX spec: exists?

---

## Generate Dashboard

Present the dashboard directly in conversation:

```
╔══════════════════════════════════════════════════════════════╗
║                 BMAD-S PROJECT DASHBOARD                     ║
║                 {project_name}                               ║
║                 Generated: {date}                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📋 PLANNING                                                 ║
║  ├── PRD:              [✅ Complete | 🔶 Partial | ❌ None]  ║
║  ├── Architecture:     [✅ | 🔶 | ❌]                       ║
║  ├── UX Spec:          [✅ | 🔶 | ❌ | ⏭ N/A]              ║
║  └── Epics/Stories:    <count> epics, <count> stories        ║
║                                                              ║
║  🏃 SPRINT STATUS                                            ║
║  ├── Current sprint:   <name or "No sprint active">          ║
║  ├── Stories:                                                ║
║  │   ├── ✅ Complete:     <count>                            ║
║  │   ├── 🔄 In progress:  <count>                           ║
║  │   ├── 📋 Ready:        <count>                           ║
║  │   └── 🚫 Blocked:      <count>                           ║
║  └── Velocity:         <stories/sprint avg or "N/A">         ║
║                                                              ║
║  🗂️ REPOSITORY                                               ║
║  ├── URL:              <url or "Not configured">             ║
║  ├── Strategy:         <Git Flow | Trunk | Simple>           ║
║  ├── Open PRs:         <count or "Unknown">                  ║
║  └── MCP:              [✅ | ❌]                             ║
║                                                              ║
║  🚀 DEPLOYMENT                                               ║
║  ├── Platform:         <AWS | Vercel | ... | "Not configured">║
║  ├── Environments:                                           ║
║  │   ├── Production:   [🟢 | 🟡 | 🔴 | ⚪ N/A]             ║
║  │   ├── Staging:      [🟢 | 🟡 | 🔴 | ⚪ N/A]             ║
║  │   └── Development:  [🟢 | 🟡 | 🔴 | ⚪ N/A]             ║
║  └── MCP:              [✅ | ❌]                             ║
║                                                              ║
║  📊 EXECUTION HISTORY (last 7 days)                          ║
║  ├── Total runs:       <count>                               ║
║  ├── ✅ Success:       <count> (<percentage>)                ║
║  ├── 🔶 Partial:      <count>                               ║
║  ├── ❌ Failed:        <count>                               ║
║  ├── ⏸ Halted:        <count>                               ║
║  └── 👻 Orphaned:      <count>                               ║
║                                                              ║
║  👻 ORPHANED EXECUTIONS (started but never finished)         ║
║  <list of STARTED entries without matching closing entry>     ║
║  Each with: agent, date, what was attempted, time since start ║
║                                                              ║
║  🔥 UNRESOLVED ERRORS                                        ║
║  <list of FAILED/PARTIAL without subsequent SUCCESS>          ║
║  Each with: agent, date, error summary, recovery action       ║
║                                                              ║
║  📈 AGENT ACTIVITY (last 7 days)                             ║
║  ├── Lisa (PM):        <count> runs, last: <date>            ║
║  ├── Homer (Dev):      <count> runs, last: <date>            ║
║  ├── Milhouse (Git):   <count> runs, last: <date>            ║
║  ├── Wiggum (Deploy):  <count> runs, last: <date>            ║
║  └── ...               (only agents with activity)           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Orphaned Executions Detail

If there are STARTED entries without a closing entry, expand each:

```
👻 EJECUCIONES HUÉRFANAS (iniciadas pero nunca terminadas):

1. [2026-02-14 16:00] Homer (DS) — Story 1-2-home-page
   Modo: REFINE
   Iniciado hace: 26 horas
   Probable causa: sesión interrumpida (context window, crash, cierre manual)
   Recuperación: Ejecutar "Homer, DS" — el VRG detectará trabajo previo
   y continuará en modo REFINE

2. [2026-02-13 09:15] Wiggum (DC) — Deploy configure
   Modo: GENERATE
   Iniciado hace: 2 días
   Probable causa: sesión interrumpida
   Recuperación: Ejecutar "Wiggum, DC" — verificará qué ficheros se generaron
```

If no orphans:
```
✅ No hay ejecuciones huérfanas. Todas las sesiones terminaron correctamente.
```

---

## Unresolved Errors Detail

If there are FAILED or PARTIAL entries without resolution, expand each:

```
🔥 ERRORES SIN RESOLVER:

1. [2026-02-14] Wiggum (DD) — Deploy to staging FAILED
   Error: ECS service not found in cluster
   Recovery: Run 'Wiggum, DD' with service creation, or create manually
   Días sin resolver: 3

2. [2026-02-12] Homer (DS) — Story 1-3-contact-form PARTIAL
   Error: 2 of 5 tests failing — email validation regex
   Recovery: Fix regex in validators/email.ts and re-run 'Homer, DS'
   Días sin resolver: 5
```

If no unresolved errors:
```
✅ No hay errores sin resolver. Todo limpio.
```

---

## Recommendations

Based on the dashboard data, suggest next actions:

> **Recomendaciones:**

For PMs:
- If orphaned executions exist → investigate and retry the workflows
- If stories are blocked → identify blockers and reassign
- If velocity is dropping → review story complexity
- If no sprint active → "Ned, SP" to plan next sprint

For Devs:
- If orphaned dev stories exist → "Homer, DS" to resume (VRG will handle it)
- If unresolved errors exist → prioritize fixing them
- If stories are ready → "Homer, DS" to start next story
- If PRs are pending → "Milhouse, GP" to review and merge

For the team:
- If no deploys in >7 days → consider deploying staging
- If error rate is high → review recent changes
- If MCPs are missing → "Smithers, SM"

---

## Export Option

> ¿Quieres que guarde este dashboard en un fichero?

- **[C] Sí** → Write to `docs/project/dashboard-<date>.md`
- **[X] No** → Exit (dashboard only shown in conversation)
