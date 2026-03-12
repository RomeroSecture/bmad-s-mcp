import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ContentRegistry } from '../content/registry.js';
import type { ProjectReader } from '../project/project-reader.js';
import { ContentReader } from '../content/reader.js';
import { ListAgentsInputSchema, listAgents } from './list-agents.js';
import { GetAgentInputSchema, getAgent } from './get-agent.js';
import { ListWorkflowsInputSchema, listWorkflows } from './list-workflows.js';
import { GetWorkflowInputSchema, getWorkflow } from './get-workflow.js';
import { GetStepInputSchema, getStep } from './get-step.js';
import { GetTemplateInputSchema, getTemplate } from './get-template.js';
import { GetDataInputSchema, getData } from './get-data.js';
import { GetTaskInputSchema, getTask } from './get-task.js';
import { GetConfigInputSchema, getConfig } from './get-config.js';
import { GetProtocolInputSchema, getProtocol } from './get-protocol.js';
import { ListTemplatesInputSchema, listTemplates } from './list-templates.js';
import { ListDataInputSchema, listData } from './list-data.js';
import { BmadHelpInputSchema, bmadHelp } from './bmad-help.js';
import { GetChecklistInputSchema, getChecklist } from './get-checklist.js';
import { SearchContentInputSchema, searchContent } from './search-content.js';
import { ListDocsInputSchema, listDocs } from './list-docs.js';
import { GetDocInputSchema, getDoc } from './get-doc.js';
import { GetExecutionLogInputSchema, getExecutionLog } from './get-execution-log.js';
import { WriteExecutionEntryInputSchema, writeExecutionEntry } from './write-execution-entry.js';
import { GetProjectStatusInputSchema, getProjectStatus } from './get-project-status.js';
import { GetSprintStatusInputSchema, getSprintStatus } from './get-sprint-status.js';
import { ListStoriesInputSchema, listStories } from './list-stories.js';
import { GetStoryInputSchema, getStory } from './get-story.js';
import { GetArtifactInventoryInputSchema, getArtifactInventory } from './get-artifact-inventory.js';
import { ListElicitationMethodsInputSchema, listElicitationMethods } from './list-elicitation-methods.js';
import { RecoverExecutionInputSchema, recoverExecution } from './recover-execution.js';

/** All BMAD content tools are read-only: they serve content but never modify anything */
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

/** Write-append annotation for ELP write tool */
const WRITE_APPEND = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

export function registerTools(server: McpServer, registry: ContentRegistry, projectReader?: ProjectReader): void {
  const reader = new ContentReader(registry);

  // === Phase 1: MVP Tools ===

  server.registerTool(
    'bmad_list_agents',
    {
      title: 'List Agents',
      description: 'List all BMAD agents with their metadata, roles, and available workflow codes',
      inputSchema: ListAgentsInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listAgents(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    'bmad_get_agent',
    {
      title: 'Get Agent',
      description: 'Get the complete YAML definition of a BMAD agent (persona, role, menu)',
      inputSchema: GetAgentInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getAgent(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Agent not found: ${input.agent_id}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_list_workflows',
    {
      title: 'List Workflows',
      description: 'List all available BMAD workflows from module-help.csv catalogs, with name, code, phase, agent, and description',
      inputSchema: ListWorkflowsInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listWorkflows(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    'bmad_get_workflow',
    {
      title: 'Get Workflow',
      description: 'Get the content of a BMAD workflow by its code (e.g., "CP", "CA") or direct path',
      inputSchema: GetWorkflowInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      if (!input.workflow_code && !input.workflow_path) {
        return {
          content: [{ type: 'text' as const, text: 'Provide either workflow_code or workflow_path' }],
          isError: true,
        };
      }
      const result = getWorkflow(registry, reader, input);
      if (!result) {
        return {
          content: [{ type: 'text' as const, text: `Workflow not found: ${input.workflow_code || input.workflow_path}` }],
          isError: true,
        };
      }
      let text = result.content;
      if (result.engine) {
        text += `\n\n---\n_Note: ${result.engine}_\n`;
      }
      return { content: [{ type: 'text' as const, text }] };
    },
  );

  server.registerTool(
    'bmad_get_step',
    {
      title: 'Get Workflow Step',
      description: "Get a specific step file from a BMAD workflow. IMPORTANT: Always include steps_dir (e.g., 'steps-c', 'steps-v') — the default 'steps' rarely exists. Use the exact parameters from the previous step's nextStepFile YAML comment.",
      inputSchema: GetStepInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getStep(registry, reader, input);
      if (!result) {
        return {
          content: [{ type: 'text' as const, text: `Step not found: ${input.step_file} in ${input.workflow_path}/${input.steps_dir ?? 'steps'}.\nCommon causes: (1) Wrong step filename — use the EXACT name from the previous step's nextStepFile frontmatter, do NOT guess names. (2) Wrong steps_dir — most workflows use steps-c, steps-v, or steps-e, NOT the default 'steps'. (3) If unsure, call bmad_get_workflow with the workflow_path to see available step files.` }],
          isError: true,
        };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_template',
    {
      title: 'Get Template',
      description: 'Get a BMAD template file with placeholders intact',
      inputSchema: GetTemplateInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getTemplate(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Template not found: ${input.template_path}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_data',
    {
      title: 'Get Data File',
      description: 'Get a BMAD data file (CSV, JSON, reference data)',
      inputSchema: GetDataInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getData(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Data file not found: ${input.data_path}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_task',
    {
      title: 'Get Task',
      description: 'Get a BMAD task definition (e.g., "workflow" for the workflow.xml engine, "help" for the help routing)',
      inputSchema: GetTaskInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getTask(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Task not found: ${input.task_name}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_config',
    {
      title: 'Get Config',
      description: 'Get the resolved BMAD configuration (env vars + local config + defaults)',
      inputSchema: GetConfigInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getConfig(input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  // === Phase 2: Enhanced Tools ===

  server.registerTool(
    'bmad_help',
    {
      title: 'BMAD Help',
      description: 'Get routing guidance: what workflow to run next based on project state and phase progression',
      inputSchema: BmadHelpInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = bmadHelp(registry, reader, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_protocol',
    {
      title: 'Get Protocol',
      description: 'Get a BMAD protocol definition (e.g., "execution-logging-protocol", "ELP")',
      inputSchema: GetProtocolInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getProtocol(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Protocol not found: ${input.protocol_name}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_list_templates',
    {
      title: 'List Templates',
      description: 'List all available BMAD templates with their paths',
      inputSchema: ListTemplatesInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listTemplates(registry, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    'bmad_list_data',
    {
      title: 'List Data Files',
      description: 'List all available BMAD data files (CSV, reference data, team configs, protocols)',
      inputSchema: ListDataInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listData(registry, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // === Phase 3: Advanced Tools ===

  server.registerTool(
    'bmad_get_checklist',
    {
      title: 'Get Checklist',
      description: 'Get the validation checklist for a BMAD workflow',
      inputSchema: GetChecklistInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getChecklist(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `No checklist found for: ${input.workflow_path}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_search_content',
    {
      title: 'Search Content',
      description: 'Search BMAD content files by keyword or phrase',
      inputSchema: SearchContentInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = searchContent(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // === Documentation Tools ===

  server.registerTool(
    'bmad_list_docs',
    {
      title: 'List Docs',
      description: 'List available BMAD-S methodology documentation (tutorials, how-to guides, explanations, reference)',
      inputSchema: ListDocsInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listDocs(registry, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    'bmad_get_doc',
    {
      title: 'Get Doc',
      description: 'Get a BMAD-S methodology documentation file by path or topic (e.g., "brainstorming", "party mode", "getting started")',
      inputSchema: GetDocInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      if (!input.doc_path && !input.topic) {
        return {
          content: [{ type: 'text' as const, text: 'Provide either doc_path or topic' }],
          isError: true,
        };
      }
      const result = getDoc(registry, reader, input);
      if (!result) {
        return {
          content: [{ type: 'text' as const, text: `Documentation not found: ${input.doc_path || input.topic}` }],
          isError: true,
        };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  // === Project State Tools ===
  // These tools work in two modes:
  // 1. Filesystem (stdio): ProjectReader reads/writes directly
  // 2. Content-passthrough (HTTP): LLM reads files locally, passes content to tool, tool processes and returns result

  const pr = projectReader ?? null;

  server.registerTool(
    'bmad_get_execution_log',
    {
      title: 'Get Execution Log',
      description: 'Read the execution log (ELP) — workflow execution history, orphan detection, error filtering. In HTTP mode, pass execution_log_content with the raw YAML of _bmad-output/execution-log.yaml.',
      inputSchema: GetExecutionLogInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getExecutionLog(pr, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_write_execution_entry',
    {
      title: 'Write Execution Entry',
      description: 'Log a workflow execution entry to the ELP (start or close phase). In HTTP mode, pass execution_log_content and the tool returns updated YAML to write back.',
      inputSchema: WriteExecutionEntryInputSchema.shape,
      annotations: WRITE_APPEND,
    },
    async (input) => {
      const result = writeExecutionEntry(pr, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_project_status',
    {
      title: 'Project Status',
      description: 'Get full project status dashboard: artifacts, executions, sprint status, orphan detection. In HTTP mode, pass execution_log_content, planning_files, implementation_files, sprint_status_content, stories_data.',
      inputSchema: GetProjectStatusInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getProjectStatus(pr, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_sprint_status',
    {
      title: 'Sprint Status',
      description: 'Get current sprint status file content. In HTTP mode, pass content with the raw YAML of sprint-status.yaml.',
      inputSchema: GetSprintStatusInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getSprintStatus(pr, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: 'No sprint status file found in implementation artifacts directory' }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_list_stories',
    {
      title: 'List Stories',
      description: 'List implementation stories with optional filtering by status or epic. In HTTP mode, pass stories_data with an array of {filename, status?, epic?}.',
      inputSchema: ListStoriesInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listStories(pr, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_story',
    {
      title: 'Get Story',
      description: 'Get full content of an implementation story by ID or filename. In HTTP mode, pass content with the raw story file content.',
      inputSchema: GetStoryInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getStory(pr, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Story not found: ${input.story_id}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_get_artifact_inventory',
    {
      title: 'Artifact Inventory',
      description: 'Scan existing project artifacts for VRG protocol — reports coverage and recommends VERIFY/REFINE/GENERATE mode. In HTTP mode, pass planning_files, implementation_files, project_doc_files with file paths.',
      inputSchema: GetArtifactInventoryInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = getArtifactInventory(pr, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.registerTool(
    'bmad_list_elicitation_methods',
    {
      title: 'List Elicitation Methods',
      description: 'List the 50 advanced elicitation techniques available for deep-dive analysis, optionally filtered by category',
      inputSchema: ListElicitationMethodsInputSchema.shape,
      annotations: READ_ONLY,
    },
    async (input) => {
      const result = listElicitationMethods(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.registerTool(
    'bmad_recover_execution',
    {
      title: 'Recover Execution',
      description: 'Error recovery (FX): diagnose orphan/failed executions and resolve them. In HTTP mode, pass execution_log_content with the raw YAML.',
      inputSchema: RecoverExecutionInputSchema.shape,
      annotations: WRITE_APPEND,
    },
    async (input) => {
      const result = recoverExecution(pr, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );
}
