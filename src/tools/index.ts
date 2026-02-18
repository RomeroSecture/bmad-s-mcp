import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ContentRegistry } from '../content/registry.js';
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

export function registerTools(server: McpServer, registry: ContentRegistry): void {
  const reader = new ContentReader(registry);

  // === Phase 1: MVP Tools ===

  server.tool(
    'bmad_list_agents',
    'List all BMAD agents with their metadata, roles, and available workflow codes',
    ListAgentsInputSchema.shape,
    async (input) => {
      const result = listAgents(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'bmad_get_agent',
    'Get the complete YAML definition of a BMAD agent (persona, role, menu)',
    GetAgentInputSchema.shape,
    async (input) => {
      const result = getAgent(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Agent not found: ${input.agent_id}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_list_workflows',
    'List all available BMAD workflows from module-help.csv catalogs, with name, code, phase, agent, and description',
    ListWorkflowsInputSchema.shape,
    async (input) => {
      const result = listWorkflows(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'bmad_get_workflow',
    'Get the content of a BMAD workflow by its code (e.g., "CP", "CA") or direct path',
    GetWorkflowInputSchema.shape,
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

  server.tool(
    'bmad_get_step',
    'Get the content of a specific step file from a BMAD workflow',
    GetStepInputSchema.shape,
    async (input) => {
      const result = getStep(registry, reader, input);
      if (!result) {
        return {
          content: [{ type: 'text' as const, text: `Step not found: ${input.step_file} in ${input.workflow_path}/${input.steps_dir}` }],
          isError: true,
        };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_get_template',
    'Get a BMAD template file with placeholders intact',
    GetTemplateInputSchema.shape,
    async (input) => {
      const result = getTemplate(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Template not found: ${input.template_path}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_get_data',
    'Get a BMAD data file (CSV, JSON, reference data)',
    GetDataInputSchema.shape,
    async (input) => {
      const result = getData(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Data file not found: ${input.data_path}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_get_task',
    'Get a BMAD task definition (e.g., "workflow" for the workflow.xml engine, "help" for the help routing)',
    GetTaskInputSchema.shape,
    async (input) => {
      const result = getTask(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Task not found: ${input.task_name}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_get_config',
    'Get the resolved BMAD configuration (env vars + local config + defaults)',
    GetConfigInputSchema.shape,
    async (input) => {
      const result = getConfig(input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  // === Phase 2: Enhanced Tools ===

  server.tool(
    'bmad_help',
    'Get routing guidance: what workflow to run next based on project state and phase progression',
    BmadHelpInputSchema.shape,
    async (input) => {
      const result = bmadHelp(registry, reader, input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_get_protocol',
    'Get a BMAD protocol definition (e.g., "execution-logging-protocol", "ELP")',
    GetProtocolInputSchema.shape,
    async (input) => {
      const result = getProtocol(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `Protocol not found: ${input.protocol_name}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_list_templates',
    'List all available BMAD templates with their paths',
    ListTemplatesInputSchema.shape,
    async (input) => {
      const result = listTemplates(registry, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'bmad_list_data',
    'List all available BMAD data files (CSV, reference data, team configs, protocols)',
    ListDataInputSchema.shape,
    async (input) => {
      const result = listData(registry, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // === Phase 3: Advanced Tools ===

  server.tool(
    'bmad_get_checklist',
    'Get the validation checklist for a BMAD workflow',
    GetChecklistInputSchema.shape,
    async (input) => {
      const result = getChecklist(registry, reader, input);
      if (!result) {
        return { content: [{ type: 'text' as const, text: `No checklist found for: ${input.workflow_path}` }], isError: true };
      }
      return { content: [{ type: 'text' as const, text: result }] };
    },
  );

  server.tool(
    'bmad_search_content',
    'Search BMAD content files by keyword or phrase',
    SearchContentInputSchema.shape,
    async (input) => {
      const result = searchContent(registry, reader, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  // === Documentation Tools ===

  server.tool(
    'bmad_list_docs',
    'List available BMAD-S methodology documentation (tutorials, how-to guides, explanations, reference)',
    ListDocsInputSchema.shape,
    async (input) => {
      const result = listDocs(registry, input);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    'bmad_get_doc',
    'Get a BMAD-S methodology documentation file by path or topic (e.g., "brainstorming", "party mode", "getting started")',
    GetDocInputSchema.shape,
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
}
