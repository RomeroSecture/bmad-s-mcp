import { describe, it, expect } from 'vitest';
import { parseModuleHelp } from '../../src/utils/csv-parser.js';

const SAMPLE_CSV = `module,phase,name,code,sequence,workflow-file,command,required,agent,options,description,output-location,outputs
core,0-setup,Setup Project,SO,1,core/workflows/setup/workflow.md,/setup,true,Smithers,,Initialize a new project,_bmad-output/,config.yaml
bmm,1-analysis,Create PRD,CP,2,bmm/workflows/create-prd/workflow.md,/create-prd,true,Lisa,,Create a PRD,_bmad-output/planning/,prd.md
bmm,anytime,Implementation Readiness,IR,99,bmm/workflows/readiness/workflow.md,,false,Lisa,,Check readiness,,readiness.md`;

describe('parseModuleHelp', () => {
  it('parses CSV into WorkflowEntry array', () => {
    const result = parseModuleHelp(SAMPLE_CSV);
    expect(result).toHaveLength(3);
  });

  it('extracts all fields correctly', () => {
    const result = parseModuleHelp(SAMPLE_CSV);
    const first = result[0];

    expect(first.module).toBe('core');
    expect(first.phase).toBe('0-setup');
    expect(first.name).toBe('Setup Project');
    expect(first.code).toBe('SO');
    expect(first.sequence).toBe('1');
    expect(first.workflow_file).toBe('core/workflows/setup/workflow.md');
    expect(first.command).toBe('/setup');
    expect(first.required).toBe(true);
    expect(first.agent).toBe('Smithers');
    expect(first.description).toBe('Initialize a new project');
  });

  it('parses required as boolean', () => {
    const result = parseModuleHelp(SAMPLE_CSV);
    expect(result[0].required).toBe(true);
    expect(result[2].required).toBe(false);
  });

  it('handles empty optional fields', () => {
    const result = parseModuleHelp(SAMPLE_CSV);
    expect(result[0].options).toBe('');
    expect(result[2].command).toBe('');
  });

  it('skips rows without a name', () => {
    const csvWithEmpty = `module,phase,name,code,sequence,workflow-file,command,required,agent,options,description,output-location,outputs
core,0-setup,,SO,1,file.md,,true,Agent,,desc,,out
bmm,1-analysis,Valid Entry,CP,2,file2.md,,true,Agent,,desc2,,out2`;
    const result = parseModuleHelp(csvWithEmpty);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Valid Entry');
  });

  it('returns empty array for empty CSV', () => {
    const result = parseModuleHelp('');
    expect(result).toEqual([]);
  });

  it('returns empty array for header-only CSV', () => {
    const result = parseModuleHelp('module,phase,name,code,sequence,workflow-file,command,required,agent,options,description,output-location,outputs');
    expect(result).toEqual([]);
  });
});
