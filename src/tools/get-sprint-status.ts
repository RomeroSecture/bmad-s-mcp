import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { SprintReader } from '../project/sprint-reader.js';

export const GetSprintStatusInputSchema = z.object({
  content: z
    .string()
    .optional()
    .describe('Raw content of sprint-status.yaml. Pass this in HTTP mode — the LLM should read the file locally.'),
});

export type GetSprintStatusInput = z.infer<typeof GetSprintStatusInputSchema>;

export function getSprintStatus(projectReader: ProjectReader | null, input: GetSprintStatusInput): string | null {
  if (input.content !== undefined) {
    return input.content || null;
  }

  if (projectReader?.isAvailable()) {
    const sprint = new SprintReader(projectReader);
    return sprint.getSprintStatus();
  }

  return null;
}
