# Step 0 — VRG Gate: Project Import Assessment

## Purpose
Determine the current state of the project and whether BMAD-S can be integrated.

## Instructions

Scan the project root directory and emit the following inventory:

```
IMPORT ASSESSMENT:

PROJECT IDENTITY:
- Project name: <from package.json, README, or directory name>
- Description: <one-line summary of what the project does>

EXISTING CODE:
- Language(s): <TypeScript, JavaScript, Python, etc.>
- Framework(s): <React, Next.js, Express, Django, etc.>
- Package manager: <npm, yarn, pnpm, pip, etc.>
- Source directory: <src/, app/, lib/, etc.>
- Estimated size: <number of source files, approximate LOC>

EXISTING DOCUMENTATION:
- README: [PRESENT | ABSENT] — <quality: minimal | adequate | comprehensive>
- Technical docs: [PRESENT | ABSENT] — <list files>
- API docs: [PRESENT | ABSENT]
- Architecture docs: [PRESENT | ABSENT]
- Requirements/specs: [PRESENT | ABSENT]

EXISTING INFRASTRUCTURE:
- Tests: [PRESENT | ABSENT] — <framework, count>
- CI/CD: [PRESENT | ABSENT] — <type>
- Docker: [PRESENT | ABSENT]
- Deployment config: [PRESENT | ABSENT] — <platform>
- Environment files: [PRESENT | ABSENT]

BMAD-S STRUCTURE:
- _bmad/ folder: [PRESENT | ABSENT]
- _bmad-output/ folder: [PRESENT | ABSENT]
- .cursor/rules/bmad.mdc: [PRESENT | ABSENT]
- config.yaml personalized: [YES | NO | ABSENT]

OBSERVATIONS:
- <any relevant notes about project maturity, quality, or risks>
```

## Execution Mode

For an import workflow, the mode is ALWAYS one of:

- **GENERATE**: No BMAD-S structure exists (typical case for imports). Full import required.
- **REFINE**: Partial BMAD-S structure exists (e.g., someone started but didn't finish). Complete what's missing.
- **VERIFY**: BMAD-S is fully configured. Redirect to normal workflows — import is not needed.

```
EXECUTION MODE: [GENERATE | REFINE | VERIFY]
Reasoning: <justification>
```

If VERIFY → inform the user that the project is already integrated with BMAD-S and suggest using the normal agent triggers. **HALT**.

If GENERATE or REFINE → proceed to Step 1.

## Wait for confirmation
Present the inventory and mode to the user. Wait for [C] before proceeding.
