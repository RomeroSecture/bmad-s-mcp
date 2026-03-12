import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { SprintReader } from '../project/sprint-reader.js';

export const GetStoryInputSchema = z.object({
  story_id: z.string().describe('Story ID or filename (e.g., "S001", "story-001")'),
  content: z
    .string()
    .optional()
    .describe('Raw content of the story file. Pass this in HTTP mode — the LLM should read the matching story file locally.'),
});

export type GetStoryInput = z.infer<typeof GetStoryInputSchema>;

export function getStory(projectReader: ProjectReader | null, input: GetStoryInput): string | null {
  if (input.content !== undefined) {
    return input.content || 'Story file is empty';
  }

  if (projectReader?.isAvailable()) {
    const sprint = new SprintReader(projectReader);
    return sprint.getStory(input.story_id);
  }

  return JSON.stringify({
    error: `No story data available. Pass content with the raw content of the story file matching "${input.story_id}" from _bmad-output/implementation-artifacts/`,
    target_dir: '_bmad-output/implementation-artifacts/',
    story_id: input.story_id,
  });
}
