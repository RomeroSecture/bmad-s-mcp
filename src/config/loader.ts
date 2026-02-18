import { readFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import yaml from 'js-yaml';
import { BmadConfigSchema, type BmadConfig } from './schema.js';

interface RawYamlConfig {
  [key: string]: string | number | boolean | undefined;
}

function getProjectRoot(): string {
  return process.env.BMAD_PROJECT_ROOT || process.cwd();
}

function loadLocalConfig(projectRoot: string): Partial<RawYamlConfig> {
  const configPaths = [
    resolve(projectRoot, '_bmad', 'bmm', 'config.yaml'),
    resolve(projectRoot, '_bmad', 'core', 'config.yaml'),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, 'utf-8');
        return (yaml.load(raw) as RawYamlConfig) || {};
      } catch {
        // Skip invalid config files
      }
    }
  }
  return {};
}

export function loadConfig(projectRoot?: string): BmadConfig {
  const root = projectRoot || getProjectRoot();
  const localConfig = loadLocalConfig(root);
  const defaultProjectName = basename(root);

  // Env vars > local config > defaults
  const raw = {
    project_name: process.env.BMAD_PROJECT_NAME || localConfig.project_name || defaultProjectName,
    user_name: process.env.BMAD_USER_NAME || localConfig.user_name || undefined,
    communication_language: process.env.BMAD_LANG || localConfig.communication_language || undefined,
    document_output_language: process.env.BMAD_DOC_LANG || localConfig.document_output_language || undefined,
    user_skill_level: process.env.BMAD_SKILL_LEVEL || localConfig.user_skill_level || undefined,
    output_folder: process.env.BMAD_OUTPUT_FOLDER
      ? `{project-root}/${process.env.BMAD_OUTPUT_FOLDER}`
      : localConfig.output_folder || undefined,
    planning_artifacts: localConfig.planning_artifacts || undefined,
    implementation_artifacts: localConfig.implementation_artifacts || undefined,
    project_knowledge: localConfig.project_knowledge || undefined,
    transport: process.env.BMAD_TRANSPORT || undefined,
    http_port: process.env.BMAD_HTTP_PORT ? parseInt(process.env.BMAD_HTTP_PORT, 10) : undefined,
  };

  // Remove undefined values so Zod defaults kick in
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  );

  return BmadConfigSchema.parse(cleaned);
}
