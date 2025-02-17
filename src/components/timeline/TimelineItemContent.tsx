import { MutableRefObject } from 'react';

import { Box, Text } from '@chakra-ui/react';

import {
  EligibleEventDetails,
  EventName,
  PoetRegisteredEventDetails,
  ProposalBuildFailedEventDetails,
  ProposalPublishFailedEventDetails,
  RetryingEventDetails,
} from '../../api/schemas/smesherEvents';
import { HexString } from '../../types/common';
import {
  IdentityState,
  isEpochItem,
  isEventItem,
  isLayerItem,
  isPoetRoundItem,
  isTimelineItem,
  TimelineItem,
  TimelineItemType,
} from '../../types/timeline';
import { sortHexString } from '../../utils/hexString';

function TimelineItemDetails({
  item,
  order,
}: {
  item: TimelineItem;
  order: MutableRefObject<HexString[]>;
}): JSX.Element {
  if (!isTimelineItem(item)) {
    return <div />;
  }

  switch (item.data.type) {
    case TimelineItemType.PoetRound:
    case TimelineItemType.Layer:
    case TimelineItemType.Epoch: {
      if (!(isEpochItem(item) || isLayerItem(item) || isPoetRoundItem(item))) {
        throw new Error(`Expected to have details for ${item.content}`);
      }
      const { details } = item.data;
      return (
        <Box mt={2}>
          {Object.entries(details.identities)
            .sort(([a], [b]) => sortHexString(a, b))
            .map(([id, state]) => {
              const idClassName = (() => {
                switch (state.state) {
                  case IdentityState.SUCCESS:
                    return 'success';
                  case IdentityState.FAILURE:
                    return 'failure';
                  case IdentityState.ELIGIBLE:
                    return 'eligible';
                  default:
                    return undefined;
                }
              })();
              const num = order.current?.indexOf(id) ?? -1;
              const numStr = num === -1 ? '?' : String(num + 1);
              return (
                <Text key={id} mb={1}>
                  <strong>
                    <Text
                      as="span"
                      className={`id-marker ${idClassName}`}
                      mr={0.5}
                    >
                      {numStr}
                    </Text>
                    <Text as="span" wordBreak="break-all" whiteSpace="pre-wrap">
                      {id}:{' '}
                    </Text>
                    <Text as="span">{state.state}</Text>
                  </strong>
                  {state.details ? (
                    <>
                      <br />
                      {state.details}
                    </>
                  ) : (
                    ''
                  )}
                </Text>
              );
            })}
        </Box>
      );
    }
    case TimelineItemType.Event: {
      if (!isEventItem(item)) {
        throw new Error(
          `Expected to have details for Event item: ${item.title}`
        );
      }

      switch (item.data.details.type) {
        case EventName.RETRYING: {
          const details = item.data.details as RetryingEventDetails;
          return (
            <Text mt={2} color="brand.red">
              {details.message}
            </Text>
          );
        }
        case EventName.PROPOSAL_PUBLISH_FAILED: {
          const details = item.data
            .details as ProposalPublishFailedEventDetails;
          return (
            <Text mt={2} color="brand.red">
              {details.message}
            </Text>
          );
        }
        case EventName.POET_REGISTERED: {
          const details = item.data.details as PoetRegisteredEventDetails;
          return (
            <Box mt={2}>
              {details.registrations.map((reg) => (
                <Text
                  key={`reg_${reg.address}_${reg.challengeHash}_${reg.roundId}`}
                  mb={1}
                >
                  {reg.address} registered for PoET round {reg.roundId}.
                </Text>
              ))}
            </Box>
          );
        }
        case EventName.PROPOSAL_BUILD_FAILED: {
          const details = item.data.details as ProposalBuildFailedEventDetails;
          return (
            <Box mt={2}>
              <Text>For layer {details.layer}:</Text>
              <Text color="brand.red">{details.message}</Text>
            </Box>
          );
        }
        case EventName.ELIGIBLE: {
          const details = item.data.details as EligibleEventDetails;
          return details.layers.length === 0 ? (
            <Text mt={2}>No eligible layers in the epoch</Text>
          ) : (
            <Text mt={2}>
              Eligible for layer{details.layers.length > 1 ? 's' : ''}:
              <br />
              {details.layers.map((x) => x.layer).join(', ')}
            </Text>
          );
        }

        // Known events with no details (or that we don't need to show)
        case EventName.UNSPECIFIED:
        case EventName.WAIT_FOR_ATX_SYNCED:
        case EventName.WAIT_FOR_POET_ROUND_END:
        case EventName.WAITING_FOR_POET_REGISTRATION_WINDOW:
        case EventName.POET_CHALLENGE_READY:
        case EventName.POET_PROOF_RECEIVED:
        case EventName.GENERATING_POST_PROOF:
        case EventName.ATX_READY:
        case EventName.ATX_BROADCASTED:
        case EventName.PROPOSAL_PUBLISHED:
        case EventName.POST_PROOF_READY:
          return <div />;
        // For unknown (new) events we'll show stringified details
        default:
          return <Box mt={2}>{JSON.stringify(item.data.details, null, 2)}</Box>;
      }
    }
    default:
      // For unknown (new) item types just show all the data
      return <Box mt={2}>{JSON.stringify(item.data, null, 2)}</Box>;
  }
}

export default TimelineItemDetails;
