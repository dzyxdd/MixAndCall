import { z } from 'zod';

export const CallBookRefSchema = z.discriminatedUnion('format', [
  z.object({
    format: z.literal('image'),
    description: z.string(),
    src: z.string().min(1),
  }),
  z.object({
    format: z.literal('table'),
    description: z.string(),
    path: z.string().min(1),
  }),
  z.object({
    format: z.literal('flow'),
    description: z.string(),
    path: z.string().min(1),
  }),
]);

export const SongSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  versions: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      summary: z.record(z.string(), z.array(z.string())).optional(),
      callbooks: z.array(CallBookRefSchema),
    }),
  ),
});

export const MixSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  mix_tag_list: z.array(z.string()),
  text_list: z.array(
    z.object({
      lang: z.string(),
      text: z.string(),
      notes: z.string().optional().default(''),
    }),
  ),
  text_list_size: z.number().int().nonnegative(),
  notes: z.string().optional().default(''),
  link_list: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      }),
    )
    .default([]),
});

export const StageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.string(),
  date: z.string(),
  team: z.string(),
  notes: z.string().optional().default(''),
  song_title_list: z.array(z.string()),
});

export const ReleaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.enum(['ep', 'album', 'single-artist']),
  date: z.string().optional().default(''),
  description: z.array(z.string()).optional().default([]),
  song_title_list: z.array(z.string()),
});

export const SongsFileSchema = z.array(SongSchema);
export const MixesFileSchema = z.array(MixSchema);
export const StagesFileSchema = z.array(StageSchema);
export const ReleasesFileSchema = z.array(ReleaseSchema);

export type CallBookRef = z.infer<typeof CallBookRefSchema>;
export type Song = z.infer<typeof SongSchema>;
export type Mix = z.infer<typeof MixSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type Release = z.infer<typeof ReleaseSchema>;
