import * as z from 'zod';

import { DurationSchema } from './common';

export const PoETConfigSchema = z.object({
  phaseShift: DurationSchema,
  cycleGap: DurationSchema,
});

export const PoETInfoResponseSchema = z.object({
  poets: z.array(z.string().url()),
  config: PoETConfigSchema,
});
