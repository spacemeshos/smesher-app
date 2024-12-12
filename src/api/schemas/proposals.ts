import * as z from 'zod';

export const ProposalSchema = z.object({
  layer: z.number(),
  proposal: z.string(),
});

export const ProposalsResponseSchema = z.object({
  proposals: z.record(z.object({ proposals: z.array(ProposalSchema) })),
});

export type Proposal = z.infer<typeof ProposalSchema>;
export type ProposalsByIdentity = z.infer<
  typeof ProposalsResponseSchema
>['proposals'];
