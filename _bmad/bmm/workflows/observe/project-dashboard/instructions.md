# Project Observability — Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {project-root}/_bmad/bmm/workflows/observe/project-dashboard/workflow.yaml</critical>
<critical>Communicate all responses in {communication_language} and language MUST be tailored to {user_skill_level}</critical>

## Routing

This workflow serves two triggers. Execute ONLY the step matching the user's request:

- **PD (Project Dashboard)**: Execute Step 1 from `{steps_path}/step-01-dashboard.md`
- **FX (Error Recovery)**: Execute Step 1 from `{steps_path}/step-02-error-recovery.md`

If the trigger is ambiguous, ask the user:
```
¿Qué necesitas?
[PD] Project Dashboard — estado general del proyecto
[FX] Error Recovery — diagnosticar y recuperar errores
```

## Execution

1. Identify which trigger invoked this workflow (PD or FX)
2. Load the corresponding step file
3. Read its COMPLETE contents and follow ALL instructions
4. If any data source from workflow.yaml is not found, report it as absent — do NOT halt
