import { z } from 'zod';
import type { ProjectReader } from '../project/project-reader.js';
import { SprintReader } from '../project/sprint-reader.js';

const StoryDataSchema = z.object({
  filename: z.string().describe('Story filename (e.g., "S001-login.md")'),
  status: z.string().optional().describe('Story status from frontmatter'),
  epic: z.string().optional().describe('Epic name/ID from frontmatter'),
});

export const ListStoriesInputSchema = z.object({
  status: z.string().optional().describe('Filter by story status (e.g., "draft", "in-progress", "done")'),
  epic: z.string().optional().describe('Filter by epic name or ID'),
  stories_data: z
    .array(StoryDataSchema)
    .optional()
    .describe('Story metadata array. Pass this in HTTP mode — the LLM should list files in implementation-artifacts/ matching S###-*.md or story-*.md patterns, and extract status/epic from their frontmatter.'),
});

export type ListStoriesInput = z.infer<typeof ListStoriesInputSchema>;

export function listStories(projectReader: ProjectReader | null, input: ListStoriesInput): string {
  // Content-passthrough mode
  if (input.stories_data) {
    let stories = input.stories_data.map((s) => ({
      id: extractStoryId(s.filename),
      filename: s.filename,
      status: s.status,
      epic: s.epic,
    }));

    if (input.status) {
      stories = stories.filter((s) => s.status?.toLowerCase() === input.status!.toLowerCase());
    }
    if (input.epic) {
      stories = stories.filter((s) => s.epic?.toLowerCase() === input.epic!.toLowerCase());
    }

    return JSON.stringify(stories, null, 2);
  }

  // Filesystem mode
  if (projectReader?.isAvailable()) {
    const sprint = new SprintReader(projectReader);
    const stories = sprint.listStories({ status: input.status, epic: input.epic });
    return JSON.stringify(stories, null, 2);
  }

  return JSON.stringify({
    error: 'No story data available. Pass stories_data with an array of {filename, status?, epic?} for each story file found in _bmad-output/implementation-artifacts/',
    target_dir: '_bmad-output/implementation-artifacts/',
    file_pattern: 'S###-*.md or story-*.md',
  });
}

function extractStoryId(filename: string): string {
  const lower = filename.toLowerCase();
  const match = lower.match(/^(s\d+)/i) || lower.match(/story[-_]?(\d+)/i);
  if (match) return match[0];
  return lower.replace(/\.(md|yaml|yml)$/, '');
}
