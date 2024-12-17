import * as z from 'zod';

import { Base64Schema } from './common';
import { BigIntStringSchema } from './strNumber';

// Event names
export enum EventName {
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

// Factory

const BaseEventSchema = <K extends EventName>(eventName: K) =>
  z.object({
    state: z.literal(eventName),
    publishEpoch: z.optional(z.number()),
    time: z.string().datetime(),
  });

function SmesherHistoryItem<T extends z.ZodRawShape>(
  state: EventName,
  detailsSchema: z.ZodObject<T>
): z.ZodObject<
  {
    state: z.ZodLiteral<EventName>;
    publishEpoch?: z.ZodOptional<z.ZodNumber>;
    time: z.ZodString;
  } & T
> {
  const baseSchema = BaseEventSchema(state);
  return z.object({
    ...baseSchema.shape,
    ...detailsSchema.shape,
  });
}

// Details schemas

const PoETRegistrationSchema = z.object({
  challengeHash: Base64Schema,
  address: z.string(),
  roundId: z.string(),
  roundEnd: z.string().datetime(),
});

// Event schemas

export const Unspecified = SmesherHistoryItem(
  EventName.UNSPECIFIED,
  z.object({})
);
export type UnspecifiedEvent = z.infer<typeof Unspecified>;
export type UnspecifiedEventDetails = undefined;

export const WaitForAtxSynced = SmesherHistoryItem(
  EventName.WAIT_FOR_ATX_SYNCED,
  z.object({ waitForAtxSynced: z.optional(z.object({})) })
);
export type WaitForAtxSyncedEvent = z.infer<typeof WaitForAtxSynced>;
export type WaitForAtxSyncedEventDetails =
  WaitForAtxSyncedEvent['waitForAtxSynced'];

export const Retrying = SmesherHistoryItem(
  EventName.RETRYING,
  z.object({
    retrying: z.object({
      message: z.string(),
    }),
  })
);
export type RetryingEvent = z.infer<typeof Retrying>;
export type RetryingEventDetails = RetryingEvent['retrying'];

export const WaitingForPoetRegistrationWindow = SmesherHistoryItem(
  EventName.WAITING_FOR_POET_REGISTRATION_WINDOW,
  z.object({ waitingForPoetRegistrationWindow: z.optional(z.object({})) })
);
export type WaitingForPoetRegistrationWindowEvent = z.infer<
  typeof WaitingForPoetRegistrationWindow
>;
export type WaitingForPoetRegistrationWindowEventDetails =
  WaitingForPoetRegistrationWindowEvent['waitingForPoetRegistrationWindow'];

export const PoetChallengeReady = SmesherHistoryItem(
  EventName.POET_CHALLENGE_READY,
  z.object({ poetChallengeReady: z.optional(z.object({})) })
);
export type PoetChallengeReadyEvent = z.infer<typeof PoetChallengeReady>;
export type PoetChallengeReadyEventDetails =
  PoetChallengeReadyEvent['poetChallengeReady'];

export const PoetRegistered = SmesherHistoryItem(
  EventName.POET_REGISTERED,
  z.object({
    poetRegistered: z.object({
      registrations: z.array(PoETRegistrationSchema),
    }),
  })
);
export type PoetRegisteredEvent = z.infer<typeof PoetRegistered>;
export type PoetRegisteredEventDetails = PoetRegisteredEvent['poetRegistered'];

export const WaitForPoetRoundEnd = SmesherHistoryItem(
  EventName.WAIT_FOR_POET_ROUND_END,
  z.object({
    waitForPoetRoundEnd: z.object({
      roundEnd: z.string().datetime(),
      publishEpochEnd: z.string().datetime(),
    }),
  })
);
export type WaitForPoetRoundEndEvent = z.infer<typeof WaitForPoetRoundEnd>;
export type WaitForPoetRoundEndEventDetails =
  WaitForPoetRoundEndEvent['waitForPoetRoundEnd'];

export const PoetProofReceived = SmesherHistoryItem(
  EventName.POET_PROOF_RECEIVED,
  z.object({
    poetProofReceived: z.object({
      poetUrl: z.string().url(),
    }),
  })
);
export type PoetProofReceivedEvent = z.infer<typeof PoetProofReceived>;
export type PoetProofReceivedEventDetails =
  PoetProofReceivedEvent['poetProofReceived'];

export const GeneratingPostProof = SmesherHistoryItem(
  EventName.GENERATING_POST_PROOF,
  z.object({ generatingPostProof: z.optional(z.object({})) })
);
export type GeneratingPostProofEvent = z.infer<typeof GeneratingPostProof>;
export type GeneratingPostProofEventDetails =
  GeneratingPostProofEvent['generatingPostProof'];

export const PostProofReady = SmesherHistoryItem(
  EventName.POST_PROOF_READY,
  z.object({ postProofReady: z.optional(z.object({})) })
);
export type PostProofReadyEvent = z.infer<typeof PostProofReady>;
export type PostProofReadyEventDetails = PostProofReadyEvent['postProofReady'];

export const AtxReady = SmesherHistoryItem(
  EventName.ATX_READY,
  z.object({ atxReady: z.optional(z.object({})) })
);
export type AtxReadyEvent = z.infer<typeof AtxReady>;
export type AtxReadyEventDetails = AtxReadyEvent['atxReady'];

export const AtxBroadcasted = SmesherHistoryItem(
  EventName.ATX_BROADCASTED,
  z.object({
    atxBroadcasted: z.object({
      atxId: Base64Schema,
    }),
  })
);
export type AtxBroadcastedEvent = z.infer<typeof AtxBroadcasted>;
export type AtxBroadcastedEventDetails = AtxBroadcastedEvent['atxBroadcasted'];

export const ProposalPublished = SmesherHistoryItem(
  EventName.PROPOSAL_PUBLISHED,
  z.object({
    proposalPublished: z.object({
      proposal: Base64Schema,
      layer: z.number(),
    }),
  })
);
export type ProposalPublishedEvent = z.infer<typeof ProposalPublished>;
export type ProposalPublishedEventDetails =
  ProposalPublishedEvent['proposalPublished'];

export const ProposalPublishFailed = SmesherHistoryItem(
  EventName.PROPOSAL_PUBLISH_FAILED,
  z.object({
    proposalPublishFailed: z.object({
      layer: BigIntStringSchema,
      message: z.string(),
      proposal: Base64Schema,
    }),
  })
);
export type ProposalPublishFailedEvent = z.infer<typeof ProposalPublishFailed>;
export type ProposalPublishFailedEventDetails =
  ProposalPublishFailedEvent['proposalPublishFailed'];

// Any types
export type AnyEvent =
  | UnspecifiedEvent
  | WaitForAtxSyncedEvent
  | RetryingEvent
  | WaitingForPoetRegistrationWindowEvent
  | PoetChallengeReadyEvent
  | PoetRegisteredEvent
  | WaitForPoetRoundEndEvent
  | PoetProofReceivedEvent
  | GeneratingPostProofEvent
  | PostProofReadyEvent
  | AtxReadyEvent
  | AtxBroadcastedEvent
  | ProposalPublishedEvent
  | ProposalPublishFailedEvent;

export type AnyEventDetails =
  | UnspecifiedEventDetails
  | WaitForAtxSyncedEventDetails
  | RetryingEventDetails
  | WaitingForPoetRegistrationWindowEventDetails
  | PoetChallengeReadyEventDetails
  | PoetRegisteredEventDetails
  | WaitForPoetRoundEndEventDetails
  | PoetProofReceivedEventDetails
  | GeneratingPostProofEventDetails
  | PostProofReadyEventDetails
  | AtxReadyEventDetails
  | AtxBroadcastedEventDetails
  | ProposalPublishedEventDetails
  | ProposalPublishFailedEventDetails;

// Pick details
export function pickSmesherEventDetails(event: AnyEvent): AnyEventDetails {
  switch (event.state) {
    case EventName.WAIT_FOR_ATX_SYNCED:
      return (event as WaitForAtxSyncedEvent).waitForAtxSynced;
    case EventName.RETRYING:
      return (event as RetryingEvent).retrying;
    case EventName.WAITING_FOR_POET_REGISTRATION_WINDOW:
      return (event as WaitingForPoetRegistrationWindowEvent)
        .waitingForPoetRegistrationWindow;
    case EventName.POET_CHALLENGE_READY:
      return (event as PoetChallengeReadyEvent).poetChallengeReady;
    case EventName.POET_REGISTERED:
      return (event as PoetRegisteredEvent).poetRegistered;
    case EventName.WAIT_FOR_POET_ROUND_END:
      return (event as WaitForPoetRoundEndEvent).waitForPoetRoundEnd;
    case EventName.POET_PROOF_RECEIVED:
      return (event as PoetProofReceivedEvent).poetProofReceived;
    case EventName.GENERATING_POST_PROOF:
      return (event as GeneratingPostProofEvent).generatingPostProof;
    case EventName.POST_PROOF_READY:
      return (event as PostProofReadyEvent).postProofReady;
    case EventName.ATX_READY:
      return (event as AtxReadyEvent).atxReady;
    case EventName.ATX_BROADCASTED:
      return (event as AtxBroadcastedEvent).atxBroadcasted;
    case EventName.PROPOSAL_PUBLISHED:
      return (event as ProposalPublishedEvent).proposalPublished;
    case EventName.PROPOSAL_PUBLISH_FAILED:
      return (event as ProposalPublishFailedEvent).proposalPublishFailed;
    default:
      return {};
  }
}
