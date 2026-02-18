import { dirname, join, basename, extname } from 'node:path';

/**
 * Transforms raw BMAD content by replacing local file references
 * ({project-root}/_bmad/..., {installed_path}/..., relative step paths)
 * with MCP tool call instructions that the LLM can follow.
 *
 * This is the core automation that makes the MCP server a drop-in
 * replacement for per-project _bmad/ installation.
 */
export function transformContent(content: string, filePath: string): string {
  const fileDir = dirname(filePath);
  const workflowDir = inferWorkflowDir(filePath);

  let result = content;

  // 1. {project-root}/_bmad/ absolute paths → MCP tool calls
  result = transformProjectRootPaths(result);

  // 2. {installed_path}/ references → MCP tool calls (relative to workflow dir)
  result = transformInstalledPaths(result, workflowDir);

  // 3. Frontmatter step/template references (nextStepFile, prdTemplate, etc.)
  result = transformFrontmatterRefs(result, fileDir, workflowDir);

  // 4. "Read fully and follow:" / "Load step:" directives with relative paths
  result = transformLoadDirectives(result, fileDir, workflowDir);

  // 5. Manifest CSV references
  result = transformManifestRefs(result);

  return result;
}

// ---------------------------------------------------------------------------
// Pattern 1: {project-root}/_bmad/... paths
// ---------------------------------------------------------------------------

function transformProjectRootPaths(content: string): string {
  // Match {project-root}/_bmad/path/to/file (with or without backticks)
  return content.replace(
    /\{project-root\}\/_bmad\/([^\s`'"<>)\]]+)/g,
    (_, bmadPath: string) => buildToolCall(bmadPath),
  );
}

// ---------------------------------------------------------------------------
// Pattern 2: {installed_path}/... references
// ---------------------------------------------------------------------------

function transformInstalledPaths(content: string, workflowDir: string): string {
  return content.replace(
    /\{installed_path\}\/([^\s`'"<>)\]]+)/g,
    (_, relPath: string) => {
      const fullPath = workflowDir ? join(workflowDir, relPath) : relPath;
      return buildToolCall(fullPath);
    },
  );
}

// ---------------------------------------------------------------------------
// Pattern 3: Frontmatter references (YAML key-value in --- block)
// ---------------------------------------------------------------------------

const STEP_KEYS = ['nextStepFile', 'continueStepFile', 'stepFile'];
const TEMPLATE_KEYS = ['prdTemplate', 'epicsTemplate', 'templatePath', 'template_path'];
const WORKFLOW_KEYS = ['advancedElicitationTask', 'partyModeWorkflow', 'workflowFile', 'workflowPath'];

function transformFrontmatterRefs(content: string, fileDir: string, workflowDir: string): string {
  // Only process if file has frontmatter
  if (!content.startsWith('---')) return content;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return content;

  const frontmatter = content.slice(0, endIdx + 3);
  const body = content.slice(endIdx + 3);

  const allKeys = [...STEP_KEYS, ...TEMPLATE_KEYS, ...WORKFLOW_KEYS];
  const keyPattern = new RegExp(
    `^(${allKeys.join('|')}):\\s*['"]?([^'"\\n]+?)['"]?\\s*$`,
    'gm',
  );

  const transformed = frontmatter.replace(keyPattern, (match, key: string, value: string) => {
    // Skip variable references like {nextStepFile} — those are resolved at runtime
    if (value.startsWith('{') && !value.startsWith('{project-root}') && !value.startsWith('{installed_path}')) {
      return match;
    }

    const resolvedPath = resolveRelativePath(value, fileDir, workflowDir);

    if (STEP_KEYS.includes(key)) {
      const stepInfo = parseStepPath(resolvedPath);
      return `${key}: '${value}' # → bmad_get_step(${JSON.stringify(stepInfo)})`;
    }
    if (TEMPLATE_KEYS.includes(key)) {
      return `${key}: '${value}' # → bmad_get_template({ "template_path": "${resolvedPath}" })`;
    }
    if (WORKFLOW_KEYS.includes(key)) {
      return `${key}: '${value}' # → bmad_get_workflow({ "workflow_path": "${resolvedPath}" })`;
    }
    return match;
  });

  return transformed + body;
}

// ---------------------------------------------------------------------------
// Pattern 4: "Read fully and follow:" / "Load step:" / "Load:" directives
// ---------------------------------------------------------------------------

function transformLoadDirectives(content: string, fileDir: string, workflowDir: string): string {
  // "Read fully and follow: `path`" or "Read fully and follow: path"
  let result = content.replace(
    /(Read fully and follow:?\s*)(?:`([^`]+)`|(\S+\.(?:md|yaml|xml)))/gi,
    (match, prefix: string, backtickPath: string | undefined, barePath: string | undefined) => {
      const rawPath = backtickPath || barePath;
      if (!rawPath) return match;

      // Skip variable-only references like {nextStepFile}
      if (/^\{[^}]+\}$/.test(rawPath)) return match;

      const resolved = resolveContentPath(rawPath, fileDir, workflowDir);
      const toolCall = buildToolCall(resolved);
      return `${prefix}${toolCall}`;
    },
  );

  // "Load step: `path`" or "Load: `path`"
  result = result.replace(
    /(Load(?:\s+step)?:?\s*)(?:`([^`]+)`|(\S+\.(?:md|yaml|xml)))/gi,
    (match, prefix: string, backtickPath: string | undefined, barePath: string | undefined) => {
      const rawPath = backtickPath || barePath;
      if (!rawPath) return match;
      if (/^\{[^}]+\}$/.test(rawPath)) return match;

      const resolved = resolveContentPath(rawPath, fileDir, workflowDir);
      const toolCall = buildToolCall(resolved);
      return `${prefix}${toolCall}`;
    },
  );

  return result;
}

// ---------------------------------------------------------------------------
// Pattern 5: Manifest CSV references
// ---------------------------------------------------------------------------

function transformManifestRefs(content: string): string {
  // agent-manifest.csv → bmad_list_agents
  content = content.replace(
    /\{project-root\}\/_bmad\/_config\/agent-manifest\.csv/g,
    'bmad_list_agents({ "module": "all" })',
  );
  // workflow-manifest.csv → bmad_list_workflows
  content = content.replace(
    /\{project-root\}\/_bmad\/_config\/workflow-manifest\.csv/g,
    'bmad_list_workflows({})',
  );
  // task-manifest.csv → bmad_list_workflows (tasks are listed via workflows)
  content = content.replace(
    /\{project-root\}\/_bmad\/_config\/task-manifest\.csv/g,
    'bmad_list_workflows({})',
  );
  // bmad-help.csv → bmad_help
  content = content.replace(
    /\{project-root\}\/_bmad\/_config\/bmad-help\.csv/g,
    'bmad_help({})',
  );

  return content;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Infers the workflow directory from a file path.
 * Walks up from the file looking for the nearest workflow root
 * (directory containing workflow.md, workflow.yaml, or workflow.xml).
 *
 * Falls back to the file's parent directory.
 */
function inferWorkflowDir(filePath: string): string {
  const parts = filePath.split('/');

  // Walk up directories looking for common workflow structure
  for (let i = parts.length - 1; i >= 0; i--) {
    const dir = parts.slice(0, i + 1).join('/');
    // Heuristic: if this directory name is a workflow-like path
    if (parts[i] === 'steps' || /^steps-[a-z]$/.test(parts[i])) {
      return parts.slice(0, i).join('/');
    }
  }

  // If file is inside a workflows/ tree, go up to the workflow dir
  const workflowsIdx = parts.indexOf('workflows');
  if (workflowsIdx !== -1 && workflowsIdx + 2 < parts.length) {
    // e.g., bmm/workflows/2-plan-workflows/create-prd/steps/step-01.md
    // The workflow dir could be at various levels; find where workflow files live
    // Try 2 levels after "workflows" first (phase-dir/workflow-name)
    if (workflowsIdx + 3 < parts.length) {
      return parts.slice(0, workflowsIdx + 3).join('/');
    }
    return parts.slice(0, workflowsIdx + 2).join('/');
  }

  return dirname(filePath);
}

/**
 * Resolves a relative path reference against the file's directory
 * and the inferred workflow directory.
 */
function resolveRelativePath(rawPath: string, fileDir: string, workflowDir: string): string {
  // Already an absolute content path
  if (!rawPath.startsWith('.') && !rawPath.startsWith('steps/')) {
    return rawPath;
  }

  // ./step-02.md — relative to current file dir
  if (rawPath.startsWith('./') || rawPath.startsWith('../')) {
    return normalizePath(join(fileDir, rawPath));
  }

  // steps/step-01.md — relative to workflow dir
  if (rawPath.startsWith('steps/') || rawPath.startsWith('steps-')) {
    return normalizePath(join(workflowDir, rawPath));
  }

  return normalizePath(join(fileDir, rawPath));
}

/**
 * Resolves a content path that might be relative, absolute with variables, etc.
 */
function resolveContentPath(rawPath: string, fileDir: string, workflowDir: string): string {
  // Already processed by pattern 1 or 2
  if (rawPath.startsWith('{project-root}')) {
    return rawPath.replace(/^\{project-root\}\/_bmad\//, '');
  }
  if (rawPath.startsWith('{installed_path}')) {
    const rel = rawPath.replace(/^\{installed_path\}\//, '');
    return workflowDir ? join(workflowDir, rel) : rel;
  }

  return resolveRelativePath(rawPath, fileDir, workflowDir);
}

/**
 * Normalizes a path by resolving ./ and ../ segments.
 */
function normalizePath(p: string): string {
  const parts = p.split('/');
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return resolved.join('/');
}

/**
 * Parses a step file path to extract workflow_path and step_file.
 */
function parseStepPath(fullPath: string): { workflow_path: string; step_file: string; steps_dir?: string } {
  const parts = fullPath.split('/');
  const fileName = parts.pop() || '';

  // Check if the parent dir is a steps variant
  const parentDir = parts[parts.length - 1];
  const isStepsDir = parentDir === 'steps' || /^steps-[a-z]$/.test(parentDir);

  if (isStepsDir) {
    const stepsDir = parts.pop()!;
    return {
      workflow_path: parts.join('/'),
      step_file: fileName,
      ...(stepsDir !== 'steps' ? { steps_dir: stepsDir } : {}),
    };
  }

  return {
    workflow_path: parts.join('/'),
    step_file: fileName,
  };
}

/**
 * Builds an MCP tool call string from a content-relative path.
 */
function buildToolCall(bmadPath: string): string {
  const lower = bmadPath.toLowerCase();

  // Agents
  if (lower.includes('/agents/') && lower.endsWith('.agent.yaml')) {
    const name = basename(bmadPath, '.agent.yaml');
    return `bmad_get_agent({ "agent_id": "${name}" })`;
  }

  // Config
  if (lower.endsWith('config.yaml') || lower.endsWith('module.yaml')) {
    return `bmad_get_config({})`;
  }

  // Tasks
  if (lower.includes('/tasks/')) {
    const name = basename(bmadPath).replace(/\.(xml|md|yaml)$/, '');
    return `bmad_get_task({ "task_name": "${name}" })`;
  }

  // Protocols
  if (lower.includes('/protocols/')) {
    const name = basename(bmadPath).replace(/\.(md|xml|yaml)$/, '');
    return `bmad_get_protocol({ "protocol_name": "${name}" })`;
  }

  // Steps (files inside steps/ or steps-X/ directories)
  if (/\/steps(?:-[a-z])?\//.test(lower)) {
    const info = parseStepPath(bmadPath);
    const args: Record<string, string> = {
      workflow_path: info.workflow_path,
      step_file: info.step_file,
    };
    if (info.steps_dir) args.steps_dir = info.steps_dir;
    return `bmad_get_step(${JSON.stringify(args)})`;
  }

  // Templates
  if (lower.includes('/templates/')) {
    return `bmad_get_template({ "template_path": "${bmadPath}" })`;
  }

  // Workflow files
  if (lower.includes('/workflows/') && /workflow[\.\-]/.test(lower)) {
    return `bmad_get_workflow({ "workflow_path": "${bmadPath}" })`;
  }

  // CSV/data files
  if (lower.endsWith('.csv')) {
    return `bmad_get_data({ "data_path": "${bmadPath}" })`;
  }

  // module-help.csv specifically
  if (lower.includes('module-help')) {
    return `bmad_list_workflows({})`;
  }

  // Fallback: generic data file
  const ext = extname(bmadPath);
  if (['.md', '.yaml', '.xml', '.txt', '.json'].includes(ext)) {
    // Try to classify by path
    if (lower.includes('/workflows/')) {
      return `bmad_get_workflow({ "workflow_path": "${bmadPath}" })`;
    }
    return `bmad_get_data({ "data_path": "${bmadPath}" })`;
  }

  return `bmad_get_data({ "data_path": "${bmadPath}" })`;
}
