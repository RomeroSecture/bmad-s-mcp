# Step 1: Personalize config.yaml

## Step 0: Secture Adaptation Gate (MANDATORY)

Check the current state of `_bmad/bmm/config.yaml`.

```
ARTIFACT INVENTORY:
- config.yaml: [PRESENT | ABSENT]
  Location: _bmad/bmm/config.yaml
  Personalized: [YES | NO — still has default placeholders]
  Fields with defaults:
    - project_name: <current value>
    - user_name: <current value>
    - communication_language: <current value>
    - document_output_language: <current value>
    - user_skill_level: <current value>
```

```
EXECUTION MODE: [VERIFY | REFINE | GENERATE]
Reasoning: <justification>
```

- **VERIFY**: Config is fully personalized → confirm and move to Step 2.
- **REFINE**: Some fields personalized, some still default → ask only about defaults.
- **GENERATE**: All fields are defaults → full guided configuration.

**Wait for [C] before proceeding.**

---

## Gather Project Information

For each field that still has a default value, ask the user:

> {user_name}, voy a personalizar la configuración de BMAD-S para este proyecto.

**project_name:**
> ¿Cómo se llama el proyecto? (Se usará en documentos y como referencia)

**user_name:**
> ¿Cómo quieres que te llame? (Nombre o alias)

**communication_language:**
> ¿En qué idioma quieres que se comuniquen los agentes?

| Opción | Valor |
|--------|-------|
| Español | Spanish |
| English | English |
| Otro | <especificar> |

**document_output_language:**
> ¿En qué idioma se generan los documentos? (Puede ser diferente al idioma de conversación)

**user_skill_level:**
> ¿Cuál es tu nivel técnico? (Afecta cómo te explican las cosas, no el código generado)

| Nivel | Descripción |
|-------|-------------|
| **beginner** | Explicaciones detalladas, sin jerga técnica |
| **intermediate** | Explicaciones concisas, algo de jerga técnica |
| **expert** | Directo al grano, terminología técnica sin filtro |

---

## Apply Configuration

Show the proposed config:

```
📋 ACCIÓN PROPUESTA: Actualizar config.yaml

project_name: "<value>"
user_name: "<value>"
communication_language: "<value>"
document_output_language: "<value>"
user_skill_level: "<value>"
output_folder: "{project-root}/_bmad-output"
planning_artifacts: "{project-root}/_bmad-output/planning-artifacts"
implementation_artifacts: "{project-root}/_bmad-output/implementation-artifacts"
project_knowledge: "{project-root}/docs/project"
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Write the updated config.yaml.

Report:
```
✅ config.yaml personalizado
```

Present menu:
- **[C] Continue** — proceed to verify project structure
