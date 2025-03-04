import * as z from 'zod';

export const VersionResponseSchema = z.object({
  version: z.string(),
});

export const VersionsMapResponseSchema = z.array(
  z.tuple([z.string(), z.string()])
);

export type VersionsMapResponse = z.infer<typeof VersionsMapResponseSchema>;
