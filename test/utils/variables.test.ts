import { describe, it, expect } from 'vitest';
import { resolveVariables, resolveConfigValue } from '../../src/config/variables.js';
import type { BmadConfig } from '../../src/config/schema.js';

const mockConfig: BmadConfig = {
  project_name: 'TestProject',
  user_name: 'Tester',
  communication_language: 'English',
  document_output_language: 'English',
  user_skill_level: 'intermediate',
  output_folder: '{project-root}/_bmad-output',
  planning_artifacts: '{project-root}/_bmad-output/planning-artifacts',
  implementation_artifacts: '{project-root}/_bmad-output/implementation-artifacts',
  project_knowledge: '{project-root}/docs/project',
  transport: 'stdio',
  http_port: 3000,
};

describe('resolveVariables', () => {
  it('resolves {project-root} to actual project root', () => {
    const result = resolveVariables('{project-root}/src', mockConfig, '/my/project');
    expect(result).toBe('/my/project/src');
  });

  it('resolves {installed_path} to _bmad in project', () => {
    const result = resolveVariables('{installed_path}/agents', mockConfig, '/my/project');
    expect(result).toBe('/my/project/_bmad/agents');
  });

  it('resolves {config_source}:key references', () => {
    const result = resolveVariables('{config_source}:project_name', mockConfig, '/root');
    expect(result).toBe('TestProject');
  });

  it('preserves unknown {config_source}:key references', () => {
    const result = resolveVariables('{config_source}:unknown_key', mockConfig, '/root');
    expect(result).toBe('{config_source}:unknown_key');
  });

  it('resolves {output_folder}', () => {
    const result = resolveVariables('{output_folder}/report.md', mockConfig, '/my/project');
    expect(result).toBe('/my/project/_bmad-output/report.md');
  });

  it('resolves {planning_artifacts}', () => {
    const result = resolveVariables('{planning_artifacts}/prd.md', mockConfig, '/p');
    expect(result).toBe('/p/_bmad-output/planning-artifacts/prd.md');
  });

  it('resolves {{date}} to current date', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = resolveVariables('Created: {{date}}', mockConfig, '/root');
    expect(result).toBe(`Created: ${today}`);
  });

  it('resolves {{project_name}} from config', () => {
    const result = resolveVariables('# {{project_name}} PRD', mockConfig, '/root');
    expect(result).toBe('# TestProject PRD');
  });

  it('resolves multiple variables in one string', () => {
    const result = resolveVariables(
      '{{project_name}} at {project-root} on {{date}}',
      mockConfig,
      '/app',
    );
    const today = new Date().toISOString().split('T')[0];
    expect(result).toBe(`TestProject at /app on ${today}`);
  });
});

describe('resolveConfigValue', () => {
  it('resolves {project-root} in config values', () => {
    expect(resolveConfigValue('{project-root}/output', '/my/proj')).toBe('/my/proj/output');
  });

  it('returns unchanged if no variables', () => {
    expect(resolveConfigValue('plain-value', '/root')).toBe('plain-value');
  });
});
