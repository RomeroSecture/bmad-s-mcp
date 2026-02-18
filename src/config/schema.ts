import { z } from 'zod';

export const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'expert']);
export type SkillLevel = z.infer<typeof SkillLevelSchema>;

export const TransportSchema = z.enum(['stdio', 'http']);
export type Transport = z.infer<typeof TransportSchema>;

export const BmadConfigSchema = z.object({
  project_name: z.string().default('MyProject'),
  user_name: z.string().default('BMad'),
  communication_language: z.string().default('English'),
  document_output_language: z.string().default('English'),
  user_skill_level: SkillLevelSchema.default('intermediate'),
  output_folder: z.string().default('{project-root}/_bmad-output'),
  planning_artifacts: z.string().default('{project-root}/_bmad-output/planning-artifacts'),
  implementation_artifacts: z.string().default('{project-root}/_bmad-output/implementation-artifacts'),
  project_knowledge: z.string().default('{project-root}/docs/project'),
  transport: TransportSchema.default('stdio'),
  http_port: z.number().int().min(1).max(65535).default(3000),
});

export type BmadConfig = z.infer<typeof BmadConfigSchema>;
