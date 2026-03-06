# Step 2: Verify Project Structure

## Check Critical Files and Folders

Scan the project for the required BMAD-S structure and report:

```
PROJECT STRUCTURE CHECK:

RULES
├── CLAUDE.md:          [✅ | ❌ MISSING]

AGENTS
├── _bmad/bmm/agents/lisa.agent.yaml:         [✅ | ❌] Lisa
├── _bmad/bmm/agents/marge.agent.yaml:        [✅ | ❌] Marge
├── _bmad/bmm/agents/frink.agent.yaml:        [✅ | ❌] Frink
├── _bmad/bmm/agents/homer.agent.yaml:        [✅ | ❌] Homer
├── _bmad/bmm/agents/edna.agent.yaml:         [✅ | ❌] Edna
├── _bmad/bmm/agents/ned.agent.yaml:          [✅ | ❌] Ned
├── _bmad/bmm/agents/monty.agent.yaml:        [✅ | ❌] Monty
├── _bmad/bmm/agents/bart.agent.yaml:         [✅ | ❌] Bart
├── _bmad/bmm/agents/wiggum.agent.yaml:       [✅ | ❌] Wiggum
├── _bmad/bmm/agents/kent/:                   [✅ | ❌] Kent
├── _bmad/bmm/agents/smithers.agent.yaml:     [✅ | ❌] Smithers
└── _bmad/bmm/agents/milhouse.agent.yaml:     [✅ | ❌] Milhouse

CONFIG
├── _bmad/bmm/config.yaml:           [✅ | ❌]
└── _bmad/bmm/teams/default-party.csv: [✅ | ❌]

OUTPUT FOLDERS
├── _bmad-output/:                    [✅ | ❌ — will be created on first run]
├── _bmad-output/planning-artifacts/: [✅ | ❌]
└── _bmad-output/implementation-artifacts/: [✅ | ❌]

PROJECT KNOWLEDGE
└── docs/project/:                    [✅ | ❌ — will be created on first run]

CORE ENGINE
├── _bmad/core/tasks/workflow.xml:    [✅ | ❌]
└── _bmad/core/agents/bmad-master.agent.yaml: [✅ | ❌]
```

---

## Verify CLAUDE.md Content

Check that `CLAUDE.md` contains:
1. Agent registry — all agents listed with correct paths
2. Trigger table — all triggers present and matching agent definitions
3. VRG protocol — Secture Adaptation section exists

If any issues found:

```
⚠️ ISSUES IN CLAUDE.md:
- <description of each issue>
```

Propose fixes and wait for [C].

---

## Create Missing Folders

If output folders don't exist, propose creation:

```
📋 ACCIÓN PROPUESTA: Crear carpetas de salida
   - _bmad-output/planning-artifacts/
   - _bmad-output/implementation-artifacts/
   - docs/project/
```

> ¿Procedo? **[C]** Continuar / **[S]** Saltar (se crearán cuando un agente las necesite)

---

## Step Summary

```
STRUCTURE VERIFICATION:
├── Rules file:       [✅ | ❌]
├── All agents:       [✅ | X missing]
├── Config:           [✅ | ❌]
├── Party CSV:        [✅ | ❌]
├── Output folders:   [✅ | PENDING]
├── Core engine:      [✅ | ❌]
└── CLAUDE.md valid:   [✅ | ❌]
```

Present menu:
- **[C] Continue** — proceed to MCP setup
- **[X] Exit** — skip MCP setup (project ready for planning agents)
