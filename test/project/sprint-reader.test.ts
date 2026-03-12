import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { SprintReader } from '../../src/project/sprint-reader.js';
import { ProjectReader } from '../../src/project/project-reader.js';
import type { BmadConfig } from '../../src/config/schema.js';

const TMP = resolve(import.meta.dirname, '..', '.tmp-sprint-reader');

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

describe('SprintReader', () => {
  let reader: ProjectReader;
  let sprint: SprintReader;
  const implDir = resolve(TMP, '_bmad-output', 'implementation-artifacts');

  beforeEach(() => {
    mkdirSync(resolve(TMP, '_bmad'), { recursive: true });
    mkdirSync(implDir, { recursive: true });
    reader = new ProjectReader(makeConfig(), TMP);
    sprint = new SprintReader(reader);
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('getSprintStatus returns null when no sprint status file', () => {
    expect(sprint.getSprintStatus()).toBeNull();
  });

  it('getSprintStatus returns content when file exists', () => {
    writeFileSync(resolve(implDir, 'sprint-status.yaml'), 'sprint: 1\nstatus: active');
    expect(sprint.getSprintStatus()).toContain('sprint: 1');
  });

  it('listStories returns empty when no stories', () => {
    expect(sprint.listStories()).toEqual([]);
  });

  it('listStories finds story files', () => {
    writeFileSync(resolve(implDir, 'S001-login.md'), '---\nstatus: draft\nepic: auth\n---\n# Login');
    writeFileSync(resolve(implDir, 'S002-signup.md'), '---\nstatus: in-progress\nepic: auth\n---\n# Signup');

    const stories = sprint.listStories();
    expect(stories).toHaveLength(2);
    expect(stories[0].id).toBe('s001');
    expect(stories[0].status).toBe('draft');
  });

  it('listStories filters by status', () => {
    writeFileSync(resolve(implDir, 'S001-login.md'), '---\nstatus: draft\n---\n# Login');
    writeFileSync(resolve(implDir, 'S002-signup.md'), '---\nstatus: done\n---\n# Signup');

    const draft = sprint.listStories({ status: 'draft' });
    expect(draft).toHaveLength(1);
    expect(draft[0].id).toBe('s001');
  });

  it('listStories filters by epic', () => {
    writeFileSync(resolve(implDir, 'S001-login.md'), '---\nstatus: draft\nepic: auth\n---\n# Login');
    writeFileSync(resolve(implDir, 'S002-home.md'), '---\nstatus: draft\nepic: ui\n---\n# Home');

    const auth = sprint.listStories({ epic: 'auth' });
    expect(auth).toHaveLength(1);
    expect(auth[0].epic).toBe('auth');
  });

  it('getStory returns content by ID', () => {
    writeFileSync(resolve(implDir, 'S001-login.md'), '# Login Story');
    const content = sprint.getStory('S001');
    expect(content).toContain('Login Story');
  });

  it('getStory returns null for non-existent story', () => {
    expect(sprint.getStory('S999')).toBeNull();
  });

  it('does not count sprint-status as a story', () => {
    writeFileSync(resolve(implDir, 'sprint-status.yaml'), 'sprint: 1');
    writeFileSync(resolve(implDir, 'S001-login.md'), '# Login');

    const stories = sprint.listStories();
    expect(stories).toHaveLength(1);
  });

  it('extracts status from markdown field pattern', () => {
    writeFileSync(resolve(implDir, 'S001-login.md'), '# Login\n\n**Status**: in-progress\n**Epic**: auth');
    const stories = sprint.listStories();
    expect(stories[0].status).toBe('in-progress');
    expect(stories[0].epic).toBe('auth');
  });
});
