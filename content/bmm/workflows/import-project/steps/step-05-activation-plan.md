# Step 5 — Agent Activation Plan

## Purpose
Give the user a concrete, ordered action plan with exact agent triggers to complete the BMAD-S integration. This is the "now what?" step.

## Instructions

### 5a. Generate activation sequence

Based on the gap analysis from Step 4, produce an ordered list of agent activations. Each entry must be copy-paste ready:

```
AGENT ACTIVATION PLAN: <project_name>

Import completed: <date>
Maturity score: <from Step 4>
Critical gaps: <count>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 — PLANNING (fill gaps in planning artifacts)

  Step 1.1: Generate PRD from existing code + docs
  ┌─────────────────────────────────────────────┐
  │ Agent: Lisa (PM)                            │
  │ Trigger: "Lisa, CP"                         │
  │ Expected mode: REFINE                       │
  │ Input: project-scan-report.md + existing    │
  │        docs in planning-artifacts/          │
  │ Output: planning-artifacts/prd.md           │
  │ Tip: Tell Lisa "The project already exists, │
  │      extract the PRD from the code and docs │
  │      rather than asking discovery questions" │
  └─────────────────────────────────────────────┘

  Step 1.2: Generate Architecture document
  ┌─────────────────────────────────────────────┐
  │ Agent: Frink (Architect)                    │
  │ Trigger: "Frink, CA"                        │
  │ Expected mode: REFINE                       │
  │ Input: prd.md + project-scan-report.md +    │
  │        existing source code                 │
  │ Output: planning-artifacts/architecture.md  │
  │ Tip: Tell Frink "This is a reverse          │
  │      architecture — document what exists,   │
  │      then propose improvements"             │
  └─────────────────────────────────────────────┘

  Step 1.3: Generate Epics & Stories (for remaining work only)
  ┌─────────────────────────────────────────────┐
  │ Agent: Lisa (PM)                            │
  │ Trigger: "Lisa, EP"                         │
  │ Expected mode: REFINE                       │
  │ Input: prd.md + architecture.md +           │
  │        import-report.md (gap analysis)      │
  │ Output: implementation-artifacts/epics.md   │
  │ Tip: Tell Lisa "Only generate epics/stories │
  │      for MISSING functionality. The existing│
  │      features in the scan report are DONE." │
  └─────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 2 — INFRASTRUCTURE (set up what's missing)

  <Include only if gaps exist. Omit entire phase if N/A>

  Step 2.1: Git repository setup
  ┌─────────────────────────────────────────────┐
  │ Agent: Milhouse (Git)                       │
  │ Trigger: "Milhouse, GR"                     │
  │ Expected mode: <GENERATE | REFINE>          │
  └─────────────────────────────────────────────┘

  Step 2.2: Test setup
  ┌─────────────────────────────────────────────┐
  │ Agent: Edna (QA)                            │
  │ Trigger: "Edna, QA"                         │
  │ Expected mode: GENERATE                     │
  │ Tip: Tell Edna "Generate tests for the      │
  │      existing code first. Prioritize the    │
  │      core features from the scan report."   │
  └─────────────────────────────────────────────┘

  Step 2.3: Deployment setup
  ┌─────────────────────────────────────────────┐
  │ Agent: Wiggum (Deploy)                      │
  │ Trigger: "Wiggum, DC"                       │
  │ Expected mode: <GENERATE | REFINE>          │
  └─────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 3 — DEVELOPMENT (implement remaining features)

  For each epic/story generated in Step 1.3:
  ┌─────────────────────────────────────────────┐
  │ Agent: Homer (Dev)                          │
  │ Trigger: "Homer, DS" + story reference      │
  │ Then: "Homer, CR" for code review           │
  │ Then: "Edna, QA" for test coverage          │
  └─────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5b. Customize the plan

**CRITICAL: The plan above is a TEMPLATE.** Customize it based on the actual gaps:

- **Remove steps that are not needed.** If the project already has tests, don't include "Test setup".
- **Reorder based on the critical path** from Step 4.
- **Add project-specific tips** based on what you learned in the scan.
- **Include only phases with actual gaps.**

### 5c. User-specific guidance

Based on what you observed:

```
IMPORT NOTES:

Things to be careful about:
- <e.g., "The matching algorithm in docs/ is very detailed. Make sure Lisa 
  and Frink read it — it's the core business logic.">
- <e.g., "The project has no backend. Frink will need to decide the backend 
  architecture from scratch.">
- <e.g., "Static data in src/data/ will need to be migrated to a database 
  at some point. Flag this as a future epic.">

Things that are already solid:
- <e.g., "Component structure is clean and well-organized.">
- <e.g., "Type definitions are comprehensive — Frink can extract the data 
  model directly from types/.">

Recommended first action:
  "<exact trigger to start with>"
```

### 5d. Save the activation plan

Append the activation plan to: `_bmad-output/import-report.md`

### 5e. Log ELP entries

Log the import workflow completion:

```yaml
# _bmad-output/execution-log.yaml
- workflow: import-project
  agent: Smithers
  trigger: IP
  started: <timestamp>
  completed: <timestamp>
  status: SUCCESS
  artifacts_created:
    - _bmad-output/planning-artifacts/project-scan-report.md
    - _bmad-output/import-report.md
    - planning artifact stubs (prd.md, architecture.md, etc.)
  notes: "Project imported from existing codebase. Maturity score: <X>%."
```

## Final message to user

```
✅ IMPORT COMPLETE

BMAD-S está integrado en <project_name>.

Resumen:
- Estructura BMAD-S: inyectada
- Documentación existente: mapeada a planning-artifacts/
- Scan del proyecto: guardado en project-scan-report.md
- Análisis de gaps: guardado en import-report.md
- Plan de activación: <N> pasos en <N> fases

Próximo paso recomendado: <exact trigger>

El proyecto está listo para trabajar con los agentes BMAD-S.
```

## WORKFLOW COMPLETE.
