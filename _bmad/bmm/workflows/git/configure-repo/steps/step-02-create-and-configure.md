# Step 2: Create Repository & Initial Configuration

## Action 1: Create Repository

Show the user exactly what will happen:

```
📋 ACCIÓN PROPUESTA: Crear repositorio
   - Nombre: <repo_name>
   - Organización: <org_name or "personal">
   - Visibilidad: <public | private>
   - Descripción: <project_name> — Managed by BMAD-S
   - Inicializar con README: Sí
   - .gitignore template: <stack>
   - Licencia: Ninguna (añadir después si necesario)
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Execute `create_repository` via GitHub MCP.

Report result:
```
✅ Repositorio creado: https://github.com/<org>/<repo>
```
or
```
❌ Error al crear repositorio: <error_message>
   Posibles causas:
   - Nombre ya existe → Elige otro nombre
   - Sin permisos en la organización → Contacta al admin
   - Token sin scope necesario → Regenera en GitHub Settings
```

---

## Action 2: Create Branch Structure

Based on the branching strategy selected in Step 1:

### Git Flow:
```
📋 ACCIÓN PROPUESTA: Crear estructura de ramas
   - main (ya existe)
   - develop ← crear desde main
   - Rama por defecto: develop
```

### Trunk-based:
```
📋 ACCIÓN PROPUESTA: Configurar ramas
   - main (ya existe, será la rama por defecto)
   - Las feature branches se crearán según se necesiten
```

### Simple:
```
📋 ACCIÓN PROPUESTA: Configurar ramas
   - main (ya existe, será la rama por defecto)
   - Las feature branches se crearán según se necesiten
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Execute `create_branch` via GitHub MCP for each branch.

Report result for each:
```
✅ Rama 'develop' creada desde 'main'
✅ Rama por defecto cambiada a 'develop'
```

---

## Action 3: Configure Branch Protection

```
📋 ACCIÓN PROPUESTA: Proteger rama 'main'
   - Require pull request before merging: ✅
   - Required approvals: 1
   - Dismiss stale reviews: ✅
   - Require status checks to pass: ✅ (se activarán cuando haya CI)
   - Restrict direct pushes: ✅ (nadie puede pushear directo a main)
   - Allow force push: ❌
   - Allow deletion: ❌
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Execute branch protection via GitHub MCP.

If Git Flow, also propose protection for develop:
```
📋 ACCIÓN PROPUESTA: Proteger rama 'develop'
   - Require pull request before merging: ✅
   - Required approvals: 1
   - Allow force push: ❌
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

Report results.

---

## Action 4: Enhance .gitignore

The initial .gitignore from GitHub templates is usually basic.
Generate an enhanced version based on the stack AND add BMAD-S specific exclusions:

```
📋 ACCIÓN PROPUESTA: Actualizar .gitignore
   Añadir estas exclusiones específicas del proyecto:

   # BMAD-S — MCP tokens (NEVER commit)
   .mcp.json

   # IDE
   .claude/
   .vscode/
   *.swp
   *.swo

   # OS
   .DS_Store
   Thumbs.db

   # Stack-specific additions beyond template:
   <additions based on stack>
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Update the file via GitHub MCP (create or update file).

---

## Step Summary

```
REPOSITORY SETUP — PROGRESS:
├── Repo created:          [✅ | ❌ | ⏭]
├── Branch structure:      [✅ | ❌ | ⏭]
├── Branch protection:     [✅ | ❌ | ⏭]
└── .gitignore enhanced:   [✅ | ❌ | ⏭]
```

Present menu:
- **[C] Continue** — proceed to final verification
- **[R] Retry** — retry any failed action
