import { Box, Text } from '@chakra-ui/react';

import {
  EventName,
  PoetRegisteredEventDetails,
  ProposalBuildFailedEventDetails,
  ProposalPublishFailedEventDetails,
  RetryingEventDetails,
} from '../../api/schemas/smesherEvents';
import { isEventDetails, TimelineItem } from '../../types/timeline';

function TimelineItemDetails({ item }: { item: TimelineItem }): JSX.Element {
  if (!isEventDetails(item)) {
    return <div />;
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
      const details = item.data.details as ProposalPublishFailedEventDetails;
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

export default TimelineItemDetails;
