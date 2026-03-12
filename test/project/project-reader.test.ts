import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { ProjectReader } from '../../src/project/project-reader.js';
import type { BmadConfig } from '../../src/config/schema.js';

const TMP = resolve(import.meta.dirname, '..', '.tmp-project-reader');

function makeConfig(overrides?: Partial<BmadConfig>): BmadConfig {
  return {
    project_name: 'TestProject',
    user_name: 'Test',
    communication_language: 'English',
    document_output_language: 'English',
    user_skill_level: 'intermediate',
    output_folder: '{project-root}/_bmad-output',
    planning_artifacts: '{project-root}/_bmad-output/planning-artifacts',
    implementation_artifacts: '{project-root}/_bmad-output/implementation-artifacts',
    project_knowledge: '{project-root}/docs/project',
    transport: 'stdio',
    http_port: 3000,
    ...overrides,
  };
}

describe('ProjectReader', () => {
  beforeEach(() => {
    mkdirSync(resolve(TMP, '_bmad'), { recursive: true });
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('isAvailable returns true when _bmad exists', () => {
    const reader = new ProjectReader(makeConfig(), TMP);
    expect(reader.isAvailable()).toBe(true);
  });

  it('isAvailable returns true when only _bmad-output exists (MCP-only project)', () => {
    const mcpOnly = resolve(TMP, 'mcp-only');
    mkdirSync(resolve(mcpOnly, '_bmad-output'), { recursive: true });
    const reader = new ProjectReader(makeConfig(), mcpOnly);
    expect(reader.isAvailable()).toBe(true);
  });

  it('isAvailable returns false when neither _bmad nor _bmad-output exist', () => {
    const noProject = resolve(TMP, 'nonexistent');
    mkdirSync(noProject, { recursive: true });
    const reader = new ProjectReader(makeConfig(), noProject);
    expect(reader.isAvailable()).toBe(false);
  });

  it('resolves output paths from config', () => {
    const reader = new ProjectReader(makeConfig(), TMP);
    expect(reader.getOutputDir()).toBe(resolve(TMP, '_bmad-output'));
    expect(reader.getPlanningDir()).toBe(resolve(TMP, '_bmad-output/planning-artifacts'));
    expect(reader.getImplDir()).toBe(resolve(TMP, '_bmad-output/implementation-artifacts'));
    expect(reader.getDocsDir()).toBe(resolve(TMP, 'docs/project'));
  });

  it('readFile returns content for existing files', () => {
    const filePath = resolve(TMP, 'test.txt');
    writeFileSync(filePath, 'hello world');
    const reader = new ProjectReader(makeConfig(), TMP);
    expect(reader.readFile(filePath)).toBe('hello world');
  });

  it('readFile returns null for non-existent files', () => {
    const reader = new ProjectReader(makeConfig(), TMP);
    expect(reader.readFile(resolve(TMP, 'nonexistent.txt'))).toBeNull();
  });

  it('listFiles returns files matching pattern', () => {
    const dir = resolve(TMP, 'subdir');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'file.md'), 'md');
    writeFileSync(resolve(dir, 'file.txt'), 'txt');
    const reader = new ProjectReader(makeConfig(), TMP);
    const files = reader.listFiles(dir, /\.md$/);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain('file.md');
  });

  it('listFiles returns empty for non-existent dir', () => {
    const reader = new ProjectReader(makeConfig(), TMP);
    expect(reader.listFiles(resolve(TMP, 'nope'))).toEqual([]);
  });

  it('fileExists works correctly', () => {
    const filePath = resolve(TMP, 'exists.txt');
    writeFileSync(filePath, 'hi');
    const reader = new ProjectReader(makeConfig(), TMP);
    expect(reader.fileExists(filePath)).toBe(true);
    expect(reader.fileExists(resolve(TMP, 'nope.txt'))).toBe(false);
  });
});
