# Step 3 — Map Existing Documentation

## Purpose
Move, copy, or link existing project documentation into the BMAD-S planning artifacts structure so that agents can find and use it.

## Instructions

### 3a. Classify existing documents

For EACH document found in Step 0 (README, docs/, etc.), classify it:

```
DOCUMENT MAPPING:

| Source file | Content type | BMAD-S destination | Action |
|-------------|-------------|-------------------|--------|
| README.md | Project overview | Keep in place (agents read it) | NONE |
| docs/X.md | Functional spec | planning-artifacts/functional/ | COPY |
| docs/Y.md | Technical reference | docs/project/ | COPY |
| ... | ... | ... | ... |
```

**Classification rules:**
- **Functional requirements** (what the system does, user flows, business rules) → `planning-artifacts/functional/`
- **Technical specifications** (algorithms, data formats, API contracts) → `planning-artifacts/` or `docs/project/`
- **Architecture decisions** → `planning-artifacts/` (will be input for Frink)
- **User research / product briefs** → `planning-artifacts/`
- **Development guides / READMEs** → `docs/project/`
- **API documentation** → `docs/project/`

### 3b. Propose actions to the user

Show the mapping table and ask:

```
Propongo mover/copiar estos documentos a la estructura BMAD-S:

<show table>

IMPORTANTE: Los ficheros originales NO se eliminarán. 
Se COPIAN a la ubicación BMAD-S para que los agentes los encuentren.

¿Procedo con esta organización? [C] / [M] Modificar
```

### 3c. Execute the mapping

For each document marked as COPY:
1. Copy the file to its BMAD-S destination
2. Do NOT delete the original
3. Report each action

### 3d. Generate stub planning artifacts

For planning artifacts that do NOT exist yet, create stub files that reference what IS available:

**If no PRD exists:**
```markdown
# PRD — <project_name>
<!-- STATUS: PENDING GENERATION -->
<!-- This project was imported into BMAD-S without a PRD. -->
<!-- To generate: "Lisa, CP" — she will work in REFINE mode using existing docs. -->

## Available inputs for PRD generation:
- Project scan report: planning-artifacts/project-scan-report.md
- Existing docs: <list copied docs>
- Source code: <src/ directory>
```

**If no architecture doc exists:**
```markdown
# Architecture — <project_name>
<!-- STATUS: PENDING GENERATION -->
<!-- This project was imported into BMAD-S without architecture documentation. -->
<!-- To generate: "Frink, CA" — he will work in REFINE mode using existing code. -->

## Available inputs for architecture generation:
- Project scan report: planning-artifacts/project-scan-report.md
- Tech stack: <from scan>
- Source structure: <from scan>
```

**If no UX spec exists:**
```markdown
# UX Design Specification — <project_name>
<!-- STATUS: PENDING GENERATION -->
<!-- To generate: "Marge, CU" — she will work in REFINE mode. -->
<!-- If Figma designs exist, provide the URL to Marge. -->
```

### 3e. Report mapping results

```
DOCUMENTATION MAPPING COMPLETE:

Copied to planning-artifacts/:
  - <list files>

Copied to docs/project/:
  - <list files>

Stub artifacts created:
  - planning-artifacts/prd.md [PENDING — run "Lisa, CP"]
  - planning-artifacts/architecture.md [PENDING — run "Frink, CA"]
  - planning-artifacts/ux-design-specification.md [PENDING — run "Marge, CU"]

Original files preserved:
  - <list original locations — untouched>
```

## Wait for [C] before proceeding to Step 4.
