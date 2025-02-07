import { Box, Text } from '@chakra-ui/react';

import {
  EligibleEventDetails,
  EventName,
  PoetRegisteredEventDetails,
  ProposalBuildFailedEventDetails,
  ProposalPublishFailedEventDetails,
  RetryingEventDetails,
} from '../../api/schemas/smesherEvents';
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

function TimelineItemDetails({ item }: { item: TimelineItem }): JSX.Element {
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
          {Object.entries(details.identities).map(([id, state]) => {
            const color =
              state.state === IdentityState.FAILURE ? 'brand.red' : undefined;
            return (
              <Text key={id} mb={1} color={color}>
                <strong>
                  {id}: {state.state}
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
          return (
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
