import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { ArtifactScanner } from '../../src/project/artifact-scanner.js';
import { ProjectReader } from '../../src/project/project-reader.js';
import type { BmadConfig } from '../../src/config/schema.js';

const TMP = resolve(import.meta.dirname, '..', '.tmp-artifact-scanner');

function makeConfig(): BmadConfig {
  return {
    project_name: 'TestProject',
    user_name: 'Test',
    communication_language: 'English',
    document_output_language: 'English',
    user_skill_level: 'intermediate',
    output_folder: `${TMP}/_bmad-output`,
    planning_artifacts: `${TMP}/_bmad-output/planning-artifacts`,
    implementation_artifacts: `${TMP}/_bmad-output/implementation-artifacts`,
    project_knowledge: `${TMP}/docs/project`,
    transport: 'stdio',
    http_port: 3000,
  };
}

describe('ArtifactScanner', () => {
  let reader: ProjectReader;
  let scanner: ArtifactScanner;

  beforeEach(() => {
    mkdirSync(resolve(TMP, '_bmad'), { recursive: true });
    reader = new ProjectReader(makeConfig(), TMP);
    scanner = new ArtifactScanner(reader);
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('returns empty inventory when no artifacts exist', () => {
    const inv = scanner.scan();
    expect(inv.planning.prd.exists).toBe(false);
    expect(inv.planning.architecture.exists).toBe(false);
    expect(inv.implementation.stories.count).toBe(0);
    expect(inv.coverage_estimate).toBe(0);
    expect(inv.recommended_mode).toBe('GENERATE');
    expect(inv.mode_reasoning).toContain('<30%');
  });

  it('detects PRD artifact', () => {
    const dir = resolve(TMP, '_bmad-output', 'planning-artifacts');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'prd.md'), '# PRD');

    const inv = scanner.scan('planning');
    expect(inv.planning.prd.exists).toBe(true);
    expect(inv.planning.prd.path).toContain('prd.md');
  });

  it('detects architecture artifact', () => {
    const dir = resolve(TMP, '_bmad-output', 'planning-artifacts');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'architecture.md'), '# Arch');

    const inv = scanner.scan('planning');
    expect(inv.planning.architecture.exists).toBe(true);
  });

  it('counts epic artifacts', () => {
    const dir = resolve(TMP, '_bmad-output', 'planning-artifacts');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'epic-01.md'), '# Epic 1');
    writeFileSync(resolve(dir, 'epic-02.md'), '# Epic 2');

    const inv = scanner.scan('planning');
    expect(inv.planning.epics.exists).toBe(true);
    expect(inv.planning.epics.count).toBe(2);
  });

  it('detects story files in implementation', () => {
    const dir = resolve(TMP, '_bmad-output', 'implementation-artifacts');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'S001-login.md'), '# Story');
    writeFileSync(resolve(dir, 'S002-signup.md'), '# Story');

    const inv = scanner.scan('implementation');
    expect(inv.implementation.stories.count).toBe(2);
  });

  it('calculates coverage estimate and REFINE mode', () => {
    const planning = resolve(TMP, '_bmad-output', 'planning-artifacts');
    const impl = resolve(TMP, '_bmad-output', 'implementation-artifacts');
    mkdirSync(planning, { recursive: true });
    mkdirSync(impl, { recursive: true });
    writeFileSync(resolve(planning, 'prd.md'), '# PRD');
    writeFileSync(resolve(planning, 'architecture.md'), '# Arch');
    writeFileSync(resolve(planning, 'product-brief.md'), '# Brief');

    const inv = scanner.scan();
    // 3 out of 6 checks = 50%
    expect(inv.coverage_estimate).toBe(50);
    expect(inv.recommended_mode).toBe('REFINE');
    expect(inv.mode_reasoning).toContain('30-90%');
  });

  it('recommends VERIFY mode at high coverage', () => {
    const planning = resolve(TMP, '_bmad-output', 'planning-artifacts');
    const impl = resolve(TMP, '_bmad-output', 'implementation-artifacts');
    mkdirSync(planning, { recursive: true });
    mkdirSync(impl, { recursive: true });
    writeFileSync(resolve(planning, 'prd.md'), '# PRD');
    writeFileSync(resolve(planning, 'architecture.md'), '# Arch');
    writeFileSync(resolve(planning, 'product-brief.md'), '# Brief');
    writeFileSync(resolve(planning, 'epic-01.md'), '# Epic');
    writeFileSync(resolve(impl, 'sprint-status.yaml'), 'sprint: 1');
    writeFileSync(resolve(impl, 'S001-story.md'), '# Story');

    const inv = scanner.scan();
    // 6 out of 6 = 100%
    expect(inv.coverage_estimate).toBe(100);
    expect(inv.recommended_mode).toBe('VERIFY');
    expect(inv.mode_reasoning).toContain('≥90%');
  });

  it('scans project docs', () => {
    const docs = resolve(TMP, 'docs', 'project');
    mkdirSync(docs, { recursive: true });
    writeFileSync(resolve(docs, 'readme.md'), '# Readme');

    const inv = scanner.scan();
    expect(inv.project_docs.length).toBe(1);
  });
});
