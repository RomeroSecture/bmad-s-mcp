import { z } from 'zod';
import { completable } from '@modelcontextprotocol/sdk/server/completable.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { listAgents } from '../tools/list-agents.js';
import { listWorkflows } from '../tools/list-workflows.js';

export function registerPrompts(server: McpServer, registry: ContentRegistry): void {
  const reader = new ContentReader(registry);

  // Cache agent/workflow lists for completions (rebuilt on each completion call)
  const getAgentNames = () =>
    listAgents(registry, reader, { module: 'all' }).map((a) => a.name.toLowerCase());

  const getWorkflowCodes = () =>
    listWorkflows(registry, reader, {}).map((w) => w.code);

  // --- bmad-start: Start or import a project ---
  server.registerPrompt(
    'bmad-start',
    {
      title: 'Start Project',
      description: 'Start a new BMAD-S project or import an existing one',
      argsSchema: {
        mode: completable(
          z.string().describe('new = new project (Smithers SO), existing = import (Smithers IP)'),
          (value) => ['new', 'existing'].filter((m) => m.startsWith(value.toLowerCase())),
        ),
      },
    },
    ({ mode }) => {
      const trigger = mode === 'existing' ? 'IP' : 'SO';
      const action = mode === 'existing' ? 'import an existing project' : 'set up a new project';
      return {
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text: `I want to ${action} using BMAD-S. Activate the Smithers agent and run the ${trigger} workflow. Use bmad_get_agent to load Smithers, then bmad_get_workflow with code "${trigger}" to get the workflow steps.`,
            },
          },
        ],
      };
    },
  );

  // --- bmad-agent: Activate any agent by name ---
  server.registerPrompt(
    'bmad-agent',
    {
      title: 'Activate Agent',
      description: 'Activate a BMAD-S agent by name',
      argsSchema: {
        agent: completable(
          z.string().describe('Agent name (e.g., lisa, homer, frink, bart)'),
          (value) => getAgentNames().filter((name) => name.includes(value.toLowerCase())),
        ),
      },
    },
    ({ agent }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Activate the "${agent}" agent from BMAD-S. Use bmad_get_agent to load the agent definition, then show me the available triggers and ask which one I want to run.`,
          },
        },
      ],
    }),
  );

  // --- bmad-workflow: Run a workflow by trigger code ---
  server.registerPrompt(
    'bmad-workflow',
    {
      title: 'Run Workflow',
      description: 'Run a BMAD-S workflow by its trigger code (e.g., CP, CA, DS)',
      argsSchema: {
        code: completable(
          z.string().describe('Workflow trigger code (e.g., CP, CA, DS, QS, SO)'),
          (value) => getWorkflowCodes().filter((c) => c.toLowerCase().startsWith(value.toLowerCase())),
        ),
      },
    },
    ({ code }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Run the BMAD-S workflow with trigger code "${code.toUpperCase()}". Use bmad_get_workflow with code "${code.toUpperCase()}" to load it, identify which agent owns it, load that agent with bmad_get_agent, and then execute the workflow steps.`,
          },
        },
      ],
    }),
  );

  // --- bmad-status: Project dashboard ---
  server.registerPrompt(
    'bmad-status',
    {
      title: 'Project Status',
      description: 'Show BMAD-S project status and recommended next steps',
    },
    () => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: 'Show me the current project status using BMAD-S. Call bmad_help to analyze the project state, then present a summary of completed artifacts, current phase, and recommended next workflow.',
          },
        },
      ],
    }),
  );

  // --- bmad-help: Methodology documentation ---
  server.registerPrompt(
    'bmad-help',
    {
      title: 'BMAD Help',
      description: 'Learn about BMAD-S methodology, agents, or workflows',
      argsSchema: {
        topic: completable(
          z.string().describe('Topic to learn about (e.g., vrg, elp, agents, workflows, getting-started)'),
          (value) =>
            ['vrg', 'elp', 'agents', 'workflows', 'getting-started', 'party-mode', 'yolo-mode', 'brainstorming']
              .filter((t) => t.includes(value.toLowerCase())),
        ),
      },
    },
    ({ topic }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: topic
              ? `Explain the "${topic}" concept from the BMAD-S methodology. Use bmad_get_doc with topic "${topic}" to find relevant documentation, then summarize it for me.`
              : 'Give me an overview of the BMAD-S methodology. Use bmad_get_doc to find the overview documentation and present the key concepts: agents, VRG protocol, workflows, and the typical project flow.',
          },
        },
      ],
    }),
  );
}
