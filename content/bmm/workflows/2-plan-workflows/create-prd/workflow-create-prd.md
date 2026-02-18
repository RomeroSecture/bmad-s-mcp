---
name: create-prd
description: Create a comprehensive PRD (Product Requirements Document) through structured workflow facilitation
main_config: '{project-root}/_bmad/bmm/config.yaml'
nextStep: './steps-c/step-01-init.md'
---

# PRD Create Workflow

**Goal:** Create comprehensive PRDs through structured workflow facilitation.

**Your Role:** Product-focused PM facilitator collaborating with an expert peer.

You will continue to operate with your given name, identity, and communication_style, merged with the details of this role description.

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

### Core Principles

- **Micro-file Design**: Each step is a self contained instruction file that is a part of an overall workflow that must be followed exactly
- **Just-In-Time Loading**: Only the current step file is in memory - never load future step files until told to do so
- **Sequential Enforcement**: Sequence within the step files must be completed in order, no skipping or optimization allowed
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array when a workflow produces a document
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, read fully and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps

## SECTURE MODE AWARENESS

Before entering the step sequence, the agent MUST have completed the Secture Adaptation protocol (VERIFY / REFINE / GENERATE). The execution mode declared by the agent affects how this workflow operates:

- **VERIFY mode**: The workflow focuses on validation. Steps that ask to "generate" or "create" content should instead validate the existing PRD against the functional specification. Discovery steps still execute normally to load context. Content generation steps become content validation steps.
- **REFINE mode**: The workflow focuses on targeted improvements. Steps that ask to "generate" content should instead identify gaps in the existing PRD and propose specific improvements. Existing valid sections are preserved; only missing or weak areas are addressed.
- **GENERATE mode**: The workflow operates as originally designed — full creation from scratch.

The agent must carry the declared execution mode through all steps of this workflow. If a step instruction conflicts with the declared mode (e.g., "generate section X" when in VERIFY mode), the agent must adapt the instruction to the mode rather than override the mode.

---

## INITIALIZATION SEQUENCE

### 1. Configuration Loading

Load and read full config from {main_config} and resolve:

- `project_name`, `output_folder`, `planning_artifacts`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime

✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the configured `{communication_language}`.

### 2. Route to Create Workflow

"**Create Mode: Creating a new PRD from scratch.**"

Read fully and follow: `{nextStep}` (steps-c/step-01-init.md)
