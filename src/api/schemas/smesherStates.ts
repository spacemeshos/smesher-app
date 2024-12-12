import * as z from 'zod';

import { Base64Schema } from './common';
import { BigIntStringSchema } from './strNumber';

export enum SmesherState {
  UNSPECIFIED = 'UNSPECIFIED',

  WAIT_FOR_ATX_SYNCED = 'WAIT_FOR_ATX_SYNCED',
  RETRYING = 'RETRYING',

  WAITING_FOR_POET_REGISTRATION_WINDOW = 'WAITING_FOR_POET_REGISTRATION_WINDOW',
  POET_CHALLENGE_READY = 'POET_CHALLENGE_READY',
  POET_REGISTERED = 'POET_REGISTERED',
  WAIT_FOR_POET_ROUND_END = 'WAIT_FOR_POET_ROUND_END',
  POET_PROOF_RECEIVED = 'POET_PROOF_RECEIVED',

  GENERATING_POST_PROOF = 'GENERATING_POST_PROOF',
  POST_PROOF_READY = 'POST_PROOF_READY',

  ATX_READY = 'ATX_READY',
  ATX_BROADCASTED = 'ATX_BROADCASTED',

  PROPOSAL_PUBLISHED = 'PROPOSAL_PUBLISHED',
  PROPOSAL_PUBLISH_FAILED = 'PROPOSAL_PUBLISH_FAILED',
}

const SmesherHistoryItem = (
  state: SmesherState,
  key?: string,
  detailsSchema?: z.ZodTypeAny
) =>
  z.object({
    state: z.literal(state),
    publishEpoch: z.optional(z.number()),
    time: z.string().datetime(),
    ...(key && detailsSchema
      ? {
          [key]: z.optional(detailsSchema),
        }
      : {}),
  });

export const PoETRegistrationSchema = z.object({
  challengeHash: Base64Schema,
  address: z.string(),
  roundId: z.string(),
  roundEnd: z.string().datetime(),
});

export const SmesherHistoryItemSchema = z.discriminatedUnion('state', [
  SmesherHistoryItem(SmesherState.UNSPECIFIED),
  SmesherHistoryItem(
    SmesherState.WAIT_FOR_ATX_SYNCED,
    'waitForAtxSynced',
    z.object({})
  ),
  SmesherHistoryItem(
    SmesherState.RETRYING,
    'retrying',
    z.object({
      message: z.string(),
    })
  ),
  SmesherHistoryItem(
    SmesherState.WAITING_FOR_POET_REGISTRATION_WINDOW,
    'waitingForPoetRegistrationWindow',
    z.object({})
  ),
  SmesherHistoryItem(
    SmesherState.POET_CHALLENGE_READY,
    'poetChallengeReady',
    z.object({})
  ),
  SmesherHistoryItem(
    SmesherState.POET_REGISTERED,
    'poetRegistered',
    z.object({
      registrations: z.array(PoETRegistrationSchema),
    })
  ),
  SmesherHistoryItem(
    SmesherState.WAIT_FOR_POET_ROUND_END,
    'waitForPoetRoundEnd',
    z.object({
      roundEnd: z.string().datetime(),
      publishEpochEnd: z.string().datetime(),
    })
  ),
  SmesherHistoryItem(
    SmesherState.POET_PROOF_RECEIVED,
    'poetProofReceived',
    z.object({
      poetUrl: z.string().url(),
    })
  ),
  SmesherHistoryItem(
    SmesherState.GENERATING_POST_PROOF,
    'generatingPostProof',
    z.object({})
  ),
  SmesherHistoryItem(
    SmesherState.POST_PROOF_READY,
    'postProofReady',
    z.object({})
  ),
  SmesherHistoryItem(SmesherState.ATX_READY, 'atxReady', z.object({})),
  SmesherHistoryItem(
    SmesherState.ATX_BROADCASTED,
    'atxBroadcasted',
    z.object({
      atxId: Base64Schema,
    })
  ),
  SmesherHistoryItem(
    SmesherState.PROPOSAL_PUBLISHED,
    'proposalPublished',
    z.object({
      proposal: Base64Schema,
      layer: z.number(),
    })
  ),
  SmesherHistoryItem(
    SmesherState.PROPOSAL_PUBLISH_FAILED,
    'proposalPublishFailed',
    z.object({
      layer: BigIntStringSchema,
      message: z.string(),
      proposal: Base64Schema,
    })
  ),
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
