import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { transformContent } from '../../src/utils/content-transformer.js';

describe('transformContent', () => {
  describe('Pattern 1: {project-root}/_bmad/ paths', () => {
    it('transforms agent paths to bmad_get_agent calls', () => {
      const content = 'Use {project-root}/_bmad/bmm/agents/lisa.agent.yaml for PM';
      const result = transformContent(content, 'test.md');
      expect(result).toContain("bmad_get_agent({ 'agent_id': 'lisa' })");
      expect(result).not.toContain('{project-root}');
    });

    it('transforms config paths to bmad_get_config calls', () => {
      const content = 'See {project-root}/_bmad/core/config.yaml';
      const result = transformContent(content, 'test.md');
      expect(result).toContain('bmad_get_config({})');
    });

    it('transforms task paths to bmad_get_task calls', () => {
      const content = 'Load {project-root}/_bmad/core/tasks/workflow.xml';
      const result = transformContent(content, 'test.md');
      expect(result).toContain("bmad_get_task({ 'task_name': 'workflow' })");
    });

    it('transforms protocol paths to bmad_get_protocol calls', () => {
      const content = 'Follow {project-root}/_bmad/core/protocols/execution-logging-protocol.md';
      const result = transformContent(content, 'test.md');
      expect(result).toContain("bmad_get_protocol({ 'protocol_name': 'execution-logging-protocol' })");
    });

    it('transforms template paths to bmad_get_template calls', () => {
      const content = 'Use {project-root}/_bmad/core/templates/prd-template.md';
      const result = transformContent(content, 'test.md');
      expect(result).toContain("bmad_get_template({ 'template_path': 'core/templates/prd-template.md' })");
    });

    it('transforms CSV data paths to bmad_get_data calls', () => {
      const content = 'Load {project-root}/_bmad/core/data/team-config.csv';
      const result = transformContent(content, 'test.md');
      expect(result).toContain("bmad_get_data({ 'data_path': 'core/data/team-config.csv' })");
    });

    it('transforms step paths to bmad_get_step calls', () => {
      const content = 'Load {project-root}/_bmad/bmm/workflows/create-prd/steps/step-01.md';
      const result = transformContent(content, 'test.md');
      expect(result).toContain('bmad_get_step(');
      expect(result).toContain("'workflow_path'");
      expect(result).toContain("'step_file': 'step-01.md'");
    });
  });

  describe('Pattern 2: {installed_path}/ references', () => {
    it('transforms installed_path references relative to workflow dir', () => {
      const content = 'Read {installed_path}/steps/step-01.md';
      const result = transformContent(content, 'bmm/workflows/create-prd/steps/step-02.md');
      expect(result).toContain('bmad_get_step(');
    });
  });

  describe('Pattern 3: Frontmatter references', () => {
    it('transforms step file references in frontmatter', () => {
      const content = `---
nextStepFile: ./step-02.md
---
# Step 1`;
      const result = transformContent(content, 'bmm/workflows/create-prd/steps/step-01.md');
      expect(result).toContain('bmad_get_step(');
    });

    it('transforms template references in frontmatter', () => {
      const content = `---
prdTemplate: core/templates/prd-template.md
---
# Create PRD`;
      const result = transformContent(content, 'bmm/workflows/create-prd/workflow.md');
      expect(result).toContain('bmad_get_template(');
    });

    it('preserves variable-only references like {nextStepFile}', () => {
      const content = `---
nextStepFile: '{nextStepFile}'
---
# Step`;
      const result = transformContent(content, 'test/steps/step-01.md');
      expect(result).toContain('{nextStepFile}');
    });
  });

  describe('Pattern 4: Load directives', () => {
    it('transforms "Read fully and follow:" with backtick path', () => {
      const content = 'Read fully and follow: `steps/step-01.md`';
      const result = transformContent(content, 'bmm/workflows/create-prd/workflow.md');
      expect(result).toContain('bmad_get_step(');
    });

    it('transforms "Load step:" directives', () => {
      const content = 'Load step: `steps/step-02.md`';
      const result = transformContent(content, 'bmm/workflows/create-prd/workflow.md');
      expect(result).toContain('bmad_get_step(');
    });
  });

  describe('Pattern 5: Manifest CSV references', () => {
    // Note: Pattern 1 runs before Pattern 5, so {project-root}/_bmad/ paths
    // are already converted by buildToolCall(). Pattern 5 only applies
    // when the full literal string is present (not via {project-root}/_bmad/).
    // With the current transform order, these become bmad_get_data calls.

    it('converts {project-root}/_bmad/_config/ CSVs via Pattern 1 (buildToolCall)', () => {
      const content = 'Read {project-root}/_bmad/_config/agent-manifest.csv';
      const result = transformContent(content, 'test.md');
      // Pattern 1 fires first and converts via buildToolCall (CSV fallback)
      expect(result).toContain('bmad_get_data(');
      expect(result).not.toContain('{project-root}');
    });

    it('workflow-manifest.csv is converted via Pattern 1', () => {
      const content = 'See {project-root}/_bmad/_config/workflow-manifest.csv';
      const result = transformContent(content, 'test.md');
      expect(result).toContain('bmad_get_data(');
    });

    it('bmad-help.csv is converted via Pattern 1', () => {
      const content = 'Load {project-root}/_bmad/_config/bmad-help.csv';
      const result = transformContent(content, 'test.md');
      expect(result).toContain('bmad_get_data(');
    });
  });

  describe('passthrough', () => {
    it('returns content unchanged when no patterns match', () => {
      const content = '# Simple Markdown\n\nNo references here.';
      const result = transformContent(content, 'test.md');
      expect(result).toBe(content);
    });
  });

  describe('YAML safety', () => {
    it('produces valid YAML when tool calls appear in YAML string values', () => {
      const yamlContent = [
        'menu:',
        '  - trigger: CP',
        '    exec: "{project-root}/_bmad/bmm/workflows/create-prd/workflow-create-prd.md"',
        '    description: "Create PRD"',
      ].join('\n');
      const result = transformContent(yamlContent, 'bmm/agents/test.agent.yaml');
      // Must be valid YAML (the original bug: nested double quotes broke parsing)
      const parsed = yaml.load(result) as { menu: Array<{ exec: string }> };
      expect(parsed).toBeDefined();
      expect(parsed.menu[0].exec).toContain('bmad_get_workflow');
    });

    it('tool call params use single quotes (YAML-safe)', () => {
      const content = 'Use {project-root}/_bmad/bmm/agents/lisa.agent.yaml';
      const result = transformContent(content, 'test.md');
      // Single quotes inside tool calls — safe inside YAML double-quoted strings
      expect(result).toContain("'agent_id': 'lisa'");
      // No double-quoted JSON params
      expect(result).not.toContain('"agent_id"');
    });
  });
});
