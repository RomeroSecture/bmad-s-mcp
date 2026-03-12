import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ContentRegistry } from './content/registry.js';
import { ProjectReader } from './project/project-reader.js';
import { loadConfig } from './config/loader.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import { bindServer, logger } from './utils/logger.js';

const SERVER_INSTRUCTIONS = `BMAD-S Method MCP Server — AI-driven agile development framework (Secture edition).

BMAD-S (Breakthrough Method of Agile AI-Driven Development — Secture) orchestrates AI agents through structured workflows to produce software artifacts: PRDs, UX specs, architecture docs, epics, stories, code, and tests. It uses the VRG protocol (Verify/Refine/Generate) so agents never overwrite valid existing work — they assess what exists first, declare their execution mode, and only then act.

## How to Start
When the user wants to start a project, plan features, or asks about BMAD-S, call bmad_help first. It assesses project state and recommends the next workflow. For methodology docs, use bmad_get_doc.

## Agents and Triggers
Each agent has a specific role and communication style defined in their YAML profile. Activate an agent with bmad_get_agent using the agent name, then run its workflow with bmad_get_workflow using the trigger code:

| Agent | Role | Key Triggers |
|-------|------|-------------|
| Lisa | Product Manager | CP (Create PRD), VP (Validate PRD), EP (Edit PRD), CE (Create Epics), IR (Readiness Check) |
| Marge | UX Designer | CU (Create UX Design) |
| Frink | Architect | CA (Create Architecture) |
| Homer | Developer | DS (Dev Story), CR (Code Review) |
| Edna | QA Engineer | QA (QA Automate) |
| Bart | Quick Flow Solo Dev | QS (Quick Spec), QD (Quick Dev), CR (Code Review) |
| Smithers | Setup & Onboarding | SM (Setup MCP), VM (Verify MCP), SO (Setup Project), IP (Import Project) |
| Milhouse | Git & Repository | GR (Configure Repo), GP (Pull Request), GS (Git Status) |
| Wiggum | Deploy & CI/CD | DC (Deploy Configure), DD (Deploy Execute), DT (Deploy Test) |
| Ned | Scrum Master | SP (Sprint Planning), CS (Create Story), VS (Validate Story), SS (Sprint Status), ER (Retrospective), CC (Correct Course) |
| Monty | Business Analyst | BP (Brainstorm), MR (Market Research), DR (Domain Research), TR (Technical Research), CB (Create Brief), GPC (Generate Project Context) |
| Kent | Tech Writer | DP (Document Project), WD (Write Document), MG (Mermaid), VD (Validate Document), EC (Explain Concept), US (Update Standards) |

When adopting an agent persona, use the communication style defined in their YAML profile. Do NOT invent catchphrases or personalities — follow what the YAML specifies.

## VRG Protocol
Agents with VRG (Lisa, Frink, Marge, Homer, Edna, Milhouse, Smithers, Wiggum) follow this protocol before acting:
1. ARTIFACT INVENTORY — scan what exists, report coverage (use bmad_get_artifact_inventory)
2. MODE DECLARATION — VERIFY (>=90%), REFINE (30-90%), or GENERATE (<30%)
3. EXECUTION — act according to declared mode
Agents WITHOUT VRG (Bart, Monty, Ned, Kent) have their own workflow entry flows — do not apply VRG to them.

## ELP Protocol (Execution Logging)
ALL agents log workflow executions to execution-log.yaml in two phases:
1. STARTED — after VRG gate (if applicable), before Step 1 (use bmad_write_execution_entry with phase="start")
2. Closing — at workflow end: SUCCESS/PARTIAL/FAILED/HALTED (use bmad_write_execution_entry with phase="close")

## Workflow Interaction Pattern
During workflows, agents present a menu at each template-output step:
- [C] Continue — accept and move to next step
- [A] Advanced Elicitation — deep-dive using techniques from bmad_list_elicitation_methods
- [P] Party Mode — multi-agent collaborative debate
- [Y] YOLO — auto-proceed for the rest of this document (VRG and ELP remain mandatory)

## CRITICAL: Step Execution Rules
- **ONE STEP AT A TIME**: Load and execute only the current step. NEVER bulk-load multiple steps or attempt to preview/pre-read future steps.
- **FOLLOW nextStepFile**: Each step's frontmatter has a \`nextStepFile\` field with the exact filename AND a YAML comment showing the exact bmad_get_step() call. Use that tool call — NEVER guess file names.
- **COLLABORATIVE, NOT AUTONOMOUS**: Each step requires user input and explicit [C] Continue before proceeding. Do NOT skip the A/P/C menu or auto-generate content for multiple steps at once.
- **NO FILE NAME GUESSING**: Step files have specific names (e.g., \`step-03-success.md\`, not \`step-03-requirements.md\`). If a step fails to load, check the previous step's nextStepFile — do NOT try variations.

## Understanding Transformed Content
BMAD content contains three types of tool references — handle each correctly:
1. **YAML comments** (\`# → bmad_get_step({...})\`): These are the EXACT tool call to use when the workflow says to load that file. Copy the parameters directly.
2. **Frontmatter variables** (\`{nextStepFile}\`, \`{advancedElicitationTask}\`): These reference the frontmatter values defined at the top. Resolve them by reading the frontmatter.
3. **Inline directives** (\`Read fully and follow:\`, \`Load step:\`): These tell you to call the tool — use the parameters from the corresponding frontmatter entry.

## Variable Resolution
- \`{outputFile}\`, \`{planning_artifacts}\`, \`{output_folder}\`: Resolve via \`bmad_get_config\` or use the project's output directory.
- \`{nextStepFile}\`: Always use the YAML comment tool call from frontmatter — it has the exact parameters.
- \`{advancedElicitationTask}\`, \`{partyModeWorkflow}\`: Use the tool call string in the frontmatter Task References section.

## steps_dir Parameter
When calling bmad_get_step, ALWAYS include the \`steps_dir\` parameter from the YAML comment. Most workflows use \`steps-c\`, \`steps-v\`, or \`steps-e\` — NOT the default \`steps\`. Omitting it will cause "Step not found" errors.

## Project State Tools
These tools access project state. They work in two modes:
- **Local (stdio)**: The server reads project files directly from the filesystem.
- **Remote (HTTP)**: The LLM must read the project files locally and pass their content as tool input parameters (e.g., execution_log_content, content, planning_files). Write tools return updated content + target file path for the LLM to write back.

| Tool | Purpose |
|------|---------|
| bmad_get_artifact_inventory | Scan existing artifacts for VRG gate |
| bmad_get_execution_log | Read execution history (ELP) |
| bmad_write_execution_entry | Log workflow executions (ELP) |
| bmad_get_project_status | Full project dashboard |
| bmad_get_sprint_status | Current sprint status |
| bmad_list_stories / bmad_get_story | Implementation stories |
| bmad_list_elicitation_methods | 50 advanced elicitation techniques |
| bmad_recover_execution | Diagnose and resolve orphan/failed executions |

## Content Tools
| Tool | Purpose |
|------|---------|
| bmad_help | Routing guidance — what workflow to run next |
| bmad_get_agent | Load an agent's full YAML definition |
| bmad_get_workflow | Load a workflow by trigger code or path |
| bmad_get_step | Load a specific step from a workflow |
| bmad_get_template | Load a template with placeholders |
| bmad_get_task | Load a task definition (e.g., workflow engine) |
| bmad_get_protocol | Load a protocol definition (e.g., ELP) |
| bmad_get_data | Load a data file (CSV, reference data) |
| bmad_get_config | Get resolved BMAD configuration |
| bmad_get_checklist | Get validation checklist for a workflow |
| bmad_get_doc | Get methodology documentation by topic |
| bmad_search_content | Search all content by keyword |
| bmad_list_agents / bmad_list_workflows / bmad_list_templates / bmad_list_data / bmad_list_docs | List available content by type |

## Typical Project Flow
1. SO (Smithers) — setup new project, or IP to import existing
2. BP (Monty) — brainstorm and research (optional)
3. CB (Monty) — create product brief (optional)
4. CP (Lisa) — create PRD
5. CU (Marge) — create UX design (optional, skip for backend-only)
6. CA (Frink) — create architecture
7. CE (Lisa) — create epics and stories
8. IR (Lisa) — implementation readiness check (quality gate)
9. SP (Ned) — sprint planning
10. CS → VS → DS → CR cycle (Ned/Homer) — per story
11. QA (Edna) — automated tests (optional, parallel or post-CR)
For small projects: QS → QD (Bart) instead of the full flow.

## When to Use
- User says "start a project", "plan a feature", "create PRD", "design architecture", "create epics"
- User mentions BMAD, BMAD-S, agents, triggers, or methodology
- User wants structured project planning, documentation, or agile workflows
- User asks "what should I do next" or "what's the project status" — call bmad_help`;

export function createServer(): { server: McpServer; registry: ContentRegistry } {
  const registry = new ContentRegistry();
  const config = loadConfig();
  const projectReader = new ProjectReader(config);

  const server = new McpServer(
    {
      name: 'bmad-mcp',
      version: '1.0.0',
    },
    {
      instructions: SERVER_INSTRUCTIONS,
      capabilities: {
        logging: {},
      },
    },
  );

  bindServer(server);

  registerTools(server, registry, projectReader);
  registerResources(server, registry, projectReader);
  registerPrompts(server, registry, projectReader);

  logger.info(`Indexed ${registry.size} content files`);
  if (projectReader.isAvailable()) {
    logger.info(`Project root: ${projectReader.projectRoot}`);
  } else {
    logger.warn('Project root not found — project tools disabled');
  }

  return { server, registry };
}
