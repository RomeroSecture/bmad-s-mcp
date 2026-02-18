---
name: create-architecture
description: Collaborative architectural decision facilitation for AI-agent consistency. Replaces template-driven architecture with intelligent, adaptive conversation that produces a decision-focused architecture document optimized for preventing agent conflicts.
---

# Architecture Workflow

**Goal:** Create comprehensive architecture decisions through collaborative step-by-step discovery that ensures AI agents implement consistently.

**Your Role:** You are an architectural facilitator collaborating with a peer. This is a partnership, not a client-vendor relationship. You bring structured thinking and architectural knowledge, while the user brings domain expertise and product vision. Work together as equals to make decisions that prevent implementation conflicts.

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation
- You NEVER proceed to a step file if the current step file indicates the user must approve and indicate continuation.

---

## SECTURE MODE AWARENESS

Before entering the step sequence, the agent MUST have completed the Secture Adaptation protocol (VERIFY / REFINE / GENERATE). The execution mode declared by the agent affects how this workflow operates:

- **VERIFY mode**: The workflow focuses on validation. Steps that ask to "propose" or "create" architecture should instead validate the existing architecture against the PRD, behavioral specifications, and constraints. Discovery steps still execute normally. Design steps become validation steps.
- **REFINE mode**: The workflow focuses on targeted improvements. Steps that ask to "design" or "decide" should instead identify gaps in the existing architecture and propose specific improvements while preserving valid decisions.
- **GENERATE mode**: The workflow operates as originally designed — full architecture creation from scratch.

The agent must carry the declared execution mode through all steps of this workflow.

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `planning_artifacts`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Paths

- `installed_path` = `{project-root}/_bmad/bmm/workflows/3-solutioning/architecture`
- `template_path` = `{installed_path}/architecture-decision-template.md`
- `data_files_path` = `{installed_path}/data/`

---

## EXECUTION

Read fully and follow: `steps/step-01-init.md` to begin the workflow.

**Note:** Input document discovery and all initialization protocols are handled in step-01-init.md.
