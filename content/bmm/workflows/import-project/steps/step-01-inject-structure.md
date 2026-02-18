# Step 1 — Prepare Project Structure

## Context
The `_bmad/` framework folder and `.cursor/rules/bmad.mdc` MUST already exist in the project before this workflow runs — that is how Smithers exists in the first place.

This step creates the OUTPUT folders and personalizes the configuration.

## Prerequisites check

Verify the framework is present:
```bash
ls _bmad/bmm/config.yaml
ls .cursor/rules/bmad.mdc
```

If either is missing → **HALT** and tell the user:

```
⚠️ BMAD-S framework not found in this project.

Before running "Smithers, IP", you need to manually copy the framework:

1. Copy the _bmad/ folder from your BMAD-S template into this project root
2. Copy .cursor/rules/bmad.mdc into .cursor/rules/
3. Restart Cursor (or open a new chat so I can read the rules)
4. Then run "Smithers, IP" again

If you don't have the BMAD-S template, clone it from:
  <official BMAD-S repo URL>
```

## Instructions (only if framework exists)

### 1a. Create output folders

Check and create ONLY what does NOT exist:

```bash
[ -d "_bmad-output" ] || mkdir -p _bmad-output
[ -d "_bmad-output/planning-artifacts" ] || mkdir -p _bmad-output/planning-artifacts
[ -d "_bmad-output/implementation-artifacts" ] || mkdir -p _bmad-output/implementation-artifacts
[ -d "docs/project" ] || mkdir -p docs/project
```

### 1b. Personalize config.yaml

Read `_bmad/bmm/config.yaml`. If it still has placeholder values, update:
- `project_name`: Extract from package.json `name` field or README title
- `user_name`: Ask the user

**Show the proposed config to the user before writing:**
```yaml
project_name: "<extracted name>"
user_name: "<ask user>"
communication_language: "Spanish"        # or ask
document_output_language: "Spanish"      # or ask
user_skill_level: "expert"               # or ask
```

### 1c. Verify structure

Report:
```
PROJECT STRUCTURE READY:
- _bmad/ framework: ✅ (pre-existing)
- .cursor/rules/bmad.mdc: ✅ (pre-existing)
- _bmad-output/planning-artifacts/: ✅ [CREATED | EXISTED]
- _bmad-output/implementation-artifacts/: ✅ [CREATED | EXISTED]
- docs/project/: ✅ [CREATED | EXISTED]
- config.yaml personalized: ✅
  - project_name: <n>
  - user_name: <n>
```

## CRITICAL: Do NOT modify any existing project files. Only ADD folders and update config.yaml.

## Wait for [C] before proceeding to Step 2.
