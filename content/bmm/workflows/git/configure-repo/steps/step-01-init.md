# Step 1: MCP Check & Repository Discovery

## Step 0: MCP Dependency Check (MANDATORY)

**STOP. Before anything, verify GitHub MCP is available.**

Attempt a read operation via GitHub MCP (e.g., list authenticated user's repositories).

If **FAILED**:
```
MCP DEPENDENCY CHECK:
- GitHub MCP Server: ❌ NOT AVAILABLE

⚠️ No puedo gestionar el repositorio sin el GitHub MCP.
Ejecuta "Smithers, SM" para configurarlo, y luego vuelve aquí.
```
**[HALT]** — Do not proceed.

If **SUCCESS**, continue.

---

## Step 0b: Secture Adaptation Gate (MANDATORY)

Execute your full `secture_adaptation` protocol:
1. Check if remote repo exists for this project
2. Check branch protections, .gitignore, README, branch structure
3. Emit **ARTIFACT INVENTORY**
4. Declare **EXECUTION MODE**

**Do NOT proceed until both blocks are printed and the user confirms with [C].**

If mode is **VERIFY** → Execute quick status report and finish.
If mode is **REFINE** → Skip to the relevant steps (only fix what's missing).
If mode is **GENERATE** → Continue with Step 1.

---

## Step 1: Gather Repository Information

Ask the user:

> {user_name}, voy a crear el repositorio en GitHub. Necesito algunos datos:

**Question 1: Organization or personal account?**
> ¿El repositorio va en una organización o en tu cuenta personal?
> Si es una organización, ¿cuál es su nombre en GitHub?

**Question 2: Repository name**
> ¿Qué nombre le damos al repositorio?
> Recomendación basada en el proyecto: `{project_name}` (en kebab-case)

**Question 3: Visibility**
> ¿Público o privado?

**Question 4: Branching strategy**
> ¿Qué estrategia de ramas prefieres?

| Estrategia | Descripción | Recomendado para |
|-----------|-------------|------------------|
| **Git Flow** | main + develop + feature branches | Equipos, releases planificadas |
| **Trunk-based** | main + feature branches cortas | CI/CD agresivo, deploys frecuentes |
| **Simple** | main + feature branches | Proyectos pequeños, 1-2 devs |

**Question 5: Tech stack** (for .gitignore)
> ¿Cuál es el stack principal? (Angular, React, Node, Python, etc.)

Store all answers for next steps.

Present menu:
- **[C] Continue** — proceed to create the repository
- **[A] Advanced** — modify any of the answers above
