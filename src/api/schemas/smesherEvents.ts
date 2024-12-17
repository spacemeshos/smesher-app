import * as z from 'zod';

import { Base64Schema } from './common';
import { BigIntStringSchema } from './strNumber';

// Event names
export enum SmesherEventName {
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

// Utils

const SmesherHistoryItem = (
  state: SmesherEventName,
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

// Details schemas

const PoETRegistrationSchema = z.object({
  challengeHash: Base64Schema,
  address: z.string(),
  roundId: z.string(),
  roundEnd: z.string().datetime(),
});

// Event schemas

export const Unspecified = SmesherHistoryItem(SmesherEventName.UNSPECIFIED);
export type UnspecifiedEvent = z.infer<typeof Unspecified>;

export const WaitForAtxSynced = SmesherHistoryItem(
  SmesherEventName.WAIT_FOR_ATX_SYNCED,
  'waitForAtxSynced',
  z.object({})
);
export type WaitForAtxSyncedEvent = z.infer<typeof WaitForAtxSynced>;

export const Retrying = SmesherHistoryItem(
  SmesherEventName.RETRYING,
  'retrying',
  z.object({
    message: z.string(),
  })
);
export type RetryingEvent = z.infer<typeof Retrying>;

export const WaitingForPoetRegistrationWindow = SmesherHistoryItem(
  SmesherEventName.WAITING_FOR_POET_REGISTRATION_WINDOW,
  'waitingForPoetRegistrationWindow',
  z.object({})
);
export type WaitingForPoetRegistrationWindowEvent = z.infer<
  typeof WaitingForPoetRegistrationWindow
>;

export const PoetChallengeReady = SmesherHistoryItem(
  SmesherEventName.POET_CHALLENGE_READY,
  'poetChallengeReady',
  z.object({})
);
export type PoetChallengeReadyEvent = z.infer<typeof PoetChallengeReady>;

export const PoetRegistered = SmesherHistoryItem(
  SmesherEventName.POET_REGISTERED,
  'poetRegistered',
  z.object({
    registrations: z.array(PoETRegistrationSchema),
  })
);
export type PoetRegisteredEvent = z.infer<typeof PoetRegistered>;

export const WaitForPoetRoundEnd = SmesherHistoryItem(
  SmesherEventName.WAIT_FOR_POET_ROUND_END,
  'waitForPoetRoundEnd',
  z.object({
    roundEnd: z.string().datetime(),
    publishEpochEnd: z.string().datetime(),
  })
);
export type WaitForPoetRoundEndEvent = z.infer<typeof WaitForPoetRoundEnd>;

export const PoetProofReceived = SmesherHistoryItem(
  SmesherEventName.POET_PROOF_RECEIVED,
  'poetProofReceived',
  z.object({
    poetUrl: z.string().url(),
  })
);
export type PoetProofReceivedEvent = z.infer<typeof PoetProofReceived>;

export const GeneratingPostProof = SmesherHistoryItem(
  SmesherEventName.GENERATING_POST_PROOF,
  'generatingPostProof',
  z.object({})
);
export type GeneratingPostProofEvent = z.infer<typeof GeneratingPostProof>;

export const PostProofReady = SmesherHistoryItem(
  SmesherEventName.POST_PROOF_READY,
  'postProofReady',
  z.object({})
);
export type PostProofReadyEvent = z.infer<typeof PostProofReady>;

export const AtxReady = SmesherHistoryItem(
  SmesherEventName.ATX_READY,
  'atxReady',
  z.object({})
);
export type AtxReadyEvent = z.infer<typeof AtxReady>;

export const AtxBroadcasted = SmesherHistoryItem(
  SmesherEventName.ATX_BROADCASTED,
  'atxBroadcasted',
  z.object({
    atxId: Base64Schema,
  })
);
export type AtxBroadcastedEvent = z.infer<typeof AtxBroadcasted>;

export const ProposalPublished = SmesherHistoryItem(
  SmesherEventName.PROPOSAL_PUBLISHED,
  'proposalPublished',
  z.object({
    proposal: Base64Schema,
    layer: z.number(),
  })
);
export type ProposalPublishedEvent = z.infer<typeof ProposalPublished>;

export const ProposalPublishFailed = SmesherHistoryItem(
  SmesherEventName.PROPOSAL_PUBLISH_FAILED,
  'proposalPublishFailed',
  z.object({
    layer: BigIntStringSchema,
    message: z.string(),
    proposal: Base64Schema,
  })
);
export type ProposalPublishFailedEvent = z.infer<typeof ProposalPublishFailed>;
