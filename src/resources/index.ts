import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ContentRegistry } from '../content/registry.js';
import { ContentReader } from '../content/reader.js';
import { listWorkflows } from '../tools/list-workflows.js';
import { listAgents } from '../tools/list-agents.js';
import { getConfig } from '../tools/get-config.js';

export function registerResources(server: McpServer, registry: ContentRegistry): void {
  const reader = new ContentReader(registry);

  // bmad://config — Resolved configuration
  server.resource(
    'config',
    'bmad://config',
    { description: 'Current resolved BMAD configuration' },
    async () => {
      const config = getConfig({});
      return {
        contents: [{ uri: 'bmad://config', mimeType: 'text/yaml', text: config }],
      };
    },
  );

  // bmad://catalog/workflows — Combined workflow catalog
  server.resource(
    'workflow-catalog',
    'bmad://catalog/workflows',
    { description: 'Complete catalog of all BMAD workflows from module-help.csv' },
    async () => {
      const workflows = listWorkflows(registry, reader, {});
      return {
        contents: [{
          uri: 'bmad://catalog/workflows',
          mimeType: 'application/json',
          text: JSON.stringify(workflows, null, 2),
        }],
      };
    },
  );

  // bmad://catalog/agents — Agent roster
  server.resource(
    'agent-roster',
    'bmad://catalog/agents',
    { description: 'Roster of all BMAD agents with metadata' },
    async () => {
      const agents = listAgents(registry, reader, { module: 'all' });
      return {
        contents: [{
          uri: 'bmad://catalog/agents',
          mimeType: 'application/json',
          text: JSON.stringify(agents, null, 2),
        }],
      };
    },
  );

  // bmad://docs/overview — Method overview
  server.resource(
    'method-overview',
    'bmad://docs/overview',
    { description: 'Overview of the BMAD Method' },
    async () => {
      // Compile an overview from available content
      const workflows = listWorkflows(registry, reader, {});
      const agents = listAgents(registry, reader, { module: 'all' });

      const overview = [
        '# BMAD Method Overview',
        '',
        'The **B**reakthrough **M**ethod of **A**gile AI-driven **D**evelopment (BMAD) is a comprehensive framework',
        'for AI-assisted software development with 12+ specialized agents and 50+ workflows.',
        '',
        '## Agents',
        ...agents.map((a) => `- ${a.icon} **${a.name}** (${a.title}) — ${a.role}`),
        '',
        '## Workflow Phases',
        '',
        '### Anytime',
        ...workflows
          .filter((w) => w.phase === 'anytime')
          .map((w) => `- **${w.name}** [${w.code}] — ${w.description}`),
        '',
        '### 1. Analysis',
        ...workflows
          .filter((w) => w.phase === '1-analysis')
          .map((w) => `- **${w.name}** [${w.code}] — ${w.description}`),
        '',
        '### 2. Planning',
        ...workflows
          .filter((w) => w.phase === '2-planning')
          .map((w) => `- **${w.name}** [${w.code}] — ${w.description}`),
        '',
        '### 3. Solutioning',
        ...workflows
          .filter((w) => w.phase === '3-solutioning')
          .map((w) => `- **${w.name}** [${w.code}] — ${w.description}`),
        '',
        '### 4. Implementation',
        ...workflows
          .filter((w) => w.phase === '4-implementation')
          .map((w) => `- **${w.name}** [${w.code}] — ${w.description}`),
        '',
        '## Getting Started',
        '',
        'Use `bmad_help` to get routing guidance for your current project state.',
        'Use `bmad_list_workflows` to see all available workflows.',
        'Use `bmad_get_workflow` with a workflow code to load and execute a workflow.',
      ].join('\n');

      return {
        contents: [{
          uri: 'bmad://docs/overview',
          mimeType: 'text/markdown',
          text: overview,
        }],
      };
    },
  );

  // bmad://core/workflow-engine — workflow.xml
  server.resource(
    'workflow-engine',
    'bmad://core/workflow-engine',
    { description: 'The workflow.xml engine for executing YAML-based BMAD workflows' },
    async () => {
      const content = reader.readFromContent('core', 'tasks', 'workflow.xml');
      return {
        contents: [{
          uri: 'bmad://core/workflow-engine',
          mimeType: 'application/xml',
          text: content || 'workflow.xml not found',
        }],
      };
    },
  );
}
