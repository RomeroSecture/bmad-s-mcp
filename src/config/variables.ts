import type { BmadConfig } from './schema.js';

/**
 * Resolves BMAD variable patterns in content strings.
 *
 * Patterns:
 *  {project-root}           → project root path
 *  {config_source}:key      → value from config
 *  {output_folder}          → resolved output folder
 *  {planning_artifacts}     → resolved planning artifacts path
 *  {implementation_artifacts} → resolved implementation artifacts path
 *  {installed_path}         → path within _bmad content
 *  {{date}}                 → current date YYYY-MM-DD
 *  {{project_name}}         → project name from config
 */
export function resolveVariables(
  content: string,
  config: BmadConfig,
  projectRoot: string,
): string {
  let result = content;

  // Resolve {project-root}
  result = result.replace(/\{project-root\}/g, projectRoot);

  // Resolve {installed_path} — points to _bmad in project
  result = result.replace(/\{installed_path\}/g, `${projectRoot}/_bmad`);

  // Resolve config-source references: {config_source}:key
  result = result.replace(/\{config_source\}:(\w+)/g, (_, key: string) => {
    const configKey = key as keyof BmadConfig;
    if (configKey in config) {
      return String(config[configKey]);
    }
    return `{config_source}:${key}`;
  });

  // Resolve named path variables
  const pathVars: Record<string, string> = {
    output_folder: config.output_folder,
    planning_artifacts: config.planning_artifacts,
    implementation_artifacts: config.implementation_artifacts,
    project_knowledge: config.project_knowledge,
  };

  for (const [name, value] of Object.entries(pathVars)) {
    const resolved = value.replace(/\{project-root\}/g, projectRoot);
    result = result.replace(new RegExp(`\\{${name}\\}`, 'g'), resolved);
  }

  // Resolve {{date}}
  result = result.replace(/\{\{date\}\}/g, new Date().toISOString().split('T')[0]);

  // Resolve {{project_name}}
  result = result.replace(/\{\{project_name\}\}/g, config.project_name);

  return result;
}

/**
 * Resolves variables in a config value (before full config is available).
 */
export function resolveConfigValue(value: string, projectRoot: string): string {
  return value.replace(/\{project-root\}/g, projectRoot);
}
