import * as z from 'zod';

export const ProposalEligibilitySchema = z.object({
  layer: z.number(),
  count: z.number(),
});

export const EpochEligibilitiesSchema = z.object({
  epochs: z.record(
    z.object({
      eligibilities: z.array(ProposalEligibilitySchema),
    })
  ),
});

export const EligibilitiesResponseSchema = z.object({
  identities: z.record(EpochEligibilitiesSchema),
});

export type ElibigilitiesByIdentity = z.infer<
  typeof EligibilitiesResponseSchema
>['identities'];
