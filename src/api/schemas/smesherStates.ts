import * as z from 'zod';

import * as SmesherEvent from './smesherEvents';

export const SmesherHistoryItemSchema = z.discriminatedUnion('state', [
  SmesherEvent.Unspecified,
  SmesherEvent.WaitForAtxSynced,
  SmesherEvent.Retrying,
  SmesherEvent.WaitingForPoetRegistrationWindow,
  SmesherEvent.PoetChallengeReady,
  SmesherEvent.PoetRegistered,
  SmesherEvent.WaitForPoetRoundEnd,
  SmesherEvent.PoetProofReceived,
  SmesherEvent.GeneratingPostProof,
  SmesherEvent.PostProofReady,
  SmesherEvent.AtxReady,
  SmesherEvent.AtxBroadcasted,
  SmesherEvent.ProposalPublished,
  SmesherEvent.ProposalBuildFailed,
  SmesherEvent.ProposalPublishFailed,
  SmesherEvent.Eligible,
]);

export type IdentityStateInfo = z.infer<typeof SmesherHistoryItemSchema>;

export const SmesherIdentitiesSchema = z.record(
  z.object({
    history: z.array(SmesherHistoryItemSchema),
  })
);

export type SmesherIdentities = z.infer<typeof SmesherIdentitiesSchema>;

export const SmesherStatesResponseSchema = z.object({
  identities: SmesherIdentitiesSchema,
});
