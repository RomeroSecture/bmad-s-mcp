# Step 1: Error Recovery

## Read Execution Log

Load `_bmad-output/execution-log.yaml` and process:

1. **Orphans**: Find STARTED entries whose `id` does NOT appear in any subsequent
   closing entry. These are interrupted sessions.
2. **Errors**: Filter for entries with result: FAILED or PARTIAL.
3. **Halts**: Filter for entries with result: HALTED.
4. Sort all by timestamp descending (most recent first).

---

## Present Orphaned Executions (if any)

```
👻 EJECUCIONES HUÉRFANAS (iniciadas pero nunca terminadas):

| # | Fecha | Agente | Workflow | Iniciado hace | Probable causa |
|---|-------|--------|----------|--------------|----------------|
| O1 | 14-Feb 16:00 | Homer | DS (story 1-2) | 26h | Sesión interrumpida |
```

For each orphan, the recovery is always the same: re-run the same agent+trigger.
The VRG protocol will detect existing work and enter REFINE mode.

---

## Present Error Summary

```
🔍 ERRORES RECIENTES:

| # | Fecha | Agente | Workflow | Error | Severidad | Resuelto? |
|---|-------|--------|----------|-------|-----------|-----------|
| 1 | 14-Feb | Wiggum | DD | ECS service not found | blocking | ❌ |
| 2 | 13-Feb | Homer | DS | 2 tests failing | degraded | ❌ |
| 3 | 12-Feb | Milhouse | GR | Branch protection 403 | blocking | ✅ (retry OK) |
```

"Resuelto" means: there is a subsequent SUCCESS entry for the same agent+workflow
combination after the error.

---

## Interactive Recovery

> {user_name}, ¿cuál quieres investigar? Indica el número.

When user selects an error, show full detail:

```
ERROR DETAIL: #1

Agent:     Wiggum (Deploy)
Workflow:  deploy-execute (DD)
Date:      2026-02-14T16:05:00
Mode:      GENERATE
Result:    FAILED

Step que falló: step-01-execute
Acción:         Update ECS service
Error:          ECS returned: service denarius-staging not found in cluster denarius-cluster

Contexto:
  El cluster ECS existe pero el servicio nunca fue creado. deploy-configure
  generó el task definition pero la creación del servicio requiere un primer
  deploy o creación manual.

Recuperación recomendada:
  → Ejecuta "Wiggum, DD" de nuevo y selecciona "Crear nuevo servicio"
  → O crea el servicio manualmente en AWS Console > ECS > denarius-cluster

Artefactos afectados:
  - Staging environment no disponible
  - Pipeline CI/CD funcionará cuando el servicio exista

¿Qué quieres hacer?
- [R] Reintentar ahora — Lanza "Wiggum, DD" directamente
- [M] Marcar como resuelto manualmente — Si lo arreglaste por tu cuenta
- [I] Ignorar — Volver a la lista
- [X] Salir
```

---

## Mark as Manually Resolved

If user selects [M]:

```
📋 ACCIÓN: Añadir entrada de resolución manual al execution log

  - id: "<timestamp>-manual-resolution"
    timestamp: "<now>"
    agent: "Manual"
    trigger: "N/A"
    workflow: "error-recovery"
    mode: "REFINE"
    result: "SUCCESS"
    duration_estimate: "manual"
    summary: "Resolución manual del error <original_id>: <user description>"
    artifacts_created: []
    artifacts_modified: []
    errors: []
    resolves: "<original_error_id>"
    next_recommended: "<based on context>"
```

> Describe brevemente cómo lo resolviste (se guardará en el log):

Store the user's description and append the resolution entry.

---

## Completion

After reviewing all errors or when user exits:

```
RESUMEN:
├── Errores revisados:     <count>
├── Reintentados:          <count>
├── Resueltos manualmente: <count>
├── Pendientes:            <count>
└── Ignorados:             <count>
```
