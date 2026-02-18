---
name: create-ux-design
description: Work with a peer UX Design expert to plan your applications UX patterns, look and feel.
---

# Create UX Design Workflow

**Goal:** Create comprehensive UX design specifications through collaborative visual exploration and informed decision-making where you act as a UX facilitator working with a product stakeholder.

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation

---

## SECTURE MODE AWARENESS

Before entering the step sequence, the agent MUST have completed the Secture Adaptation protocol (VERIFY / REFINE / GENERATE). The execution mode declared by the agent affects how this workflow operates:

- **VERIFY mode**: The workflow focuses on validation. Steps that ask to "create" or "design" UX artifacts should instead validate the existing UX specification against the PRD, user journeys, and accessibility requirements. Discovery steps still execute normally.
- **REFINE mode**: The workflow focuses on targeted improvements. Steps that ask to "design" should instead identify gaps in the existing UX artifacts and propose specific improvements while preserving valid design decisions and patterns.
- **GENERATE mode**: The workflow operates as originally designed — full UX design creation from scratch.

The agent must carry the declared execution mode through all steps of this workflow.

### Design step-skip rules

When the user has indicated a pre-existing design exists (Figma, screenshots, style guide, or description), the agent's `secture_adaptation` section defines specific steps that are SKIPPED or transformed into EXTRACT steps. The agent MUST follow the step-skip table defined in its design step-skip rules. In summary:

- **Steps 4, 5, 9**: SKIP entirely — the existing design already embodies these decisions. Emit a brief note and move on.
- **Steps 6, 8**: EXTRACT — read the design system and visual foundation from the existing design (via Figma MCP, screenshots, or style guide), document as established facts, do NOT propose alternatives.
- **All other steps**: Execute normally, but in validation/audit mode rather than creation mode.

This ensures Sally never contradicts or overrides an existing design's decisions.

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `planning_artifacts`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime

### Paths

- `installed_path` = `{project-root}/_bmad/bmm/workflows/2-plan-workflows/create-ux-design`
- `template_path` = `{installed_path}/ux-design-template.md`
- `default_output_file` = `{planning_artifacts}/ux-design-specification.md`

## EXECUTION

- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`
- Read fully and follow: `steps/step-01-init.md` to begin the UX design workflow.