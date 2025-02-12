import { useMemo } from 'react';

import { Box, Flex, Heading, Tag, Text, Tooltip } from '@chakra-ui/react';

import { ElibigilitiesByIdentity } from '../../api/schemas/eligibilities';
import { ProposalsByIdentity } from '../../api/schemas/proposals';
import { HexString } from '../../types/common';
import { RewardsPerIdentity } from '../../types/reward';
import { formatSmidge } from '../../utils/smh';

type Props = {
  id: HexString;
  eligibilities?: ElibigilitiesByIdentity[HexString]['epochs'];
  proposals?: ProposalsByIdentity[HexString]['proposals'];
  rewards?: RewardsPerIdentity[HexString];
  currentLayer?: number;
};

function SmesherIdentityDetails({
  id,
  eligibilities = {},
  proposals = [],
  rewards = [],
  currentLayer = 0,
}: Props): JSX.Element {
  const proposalLayers = useMemo(
    () => new Set(proposals.map((proposal) => proposal.layer)),
    [proposals]
  );

  return (
    <Flex w="100%" justifyContent="space-between" mb={2}>
      <Box w="55%">
        <Heading fontSize="sm">Eligibilities</Heading>
        {Object.entries(eligibilities).map(
          ([epoch, { eligibilities: epochEligibilities }]) => (
            <Box
              key={`Eligibilities_${id}_${epoch}`}
              my={2}
              p={3}
              borderWidth={1}
              borderStyle="solid"
              borderColor="brand.darkGray"
              borderRadius="lg"
            >
              <Text fontSize="sm">Epoch {epoch}</Text>
              <Text fontSize="xs" color="gray.500" mt={1} mb={0.5}>
                Layers
              </Text>
              <Box lineHeight={0}>
                {epochEligibilities
                  .sort((a, b) => a.layer - b.layer)
                  .map((el) => (
                    <Tooltip
                      label={
                        <>
                          <Text fontSize="xs">Layer: {el.layer}</Text>
                          <Text fontSize="xs" mb={1}>
                            Weight: {el.count}
                          </Text>
                          {proposalLayers.has(el.layer) && (
                            <Text color="brand.darkGreen" fontSize="xs">
                              Published:{' '}
                              {proposals.find((p) => p.layer === el.layer)
                                ?.proposal ?? ''}
                            </Text>
                          )}
                        </>
                      }
                      // eslint-disable-next-line max-len
                      key={`elig_${id}_${epoch}_${el.layer}`}
                    >
                      <Tag
                        size="sm"
                        mr={0.5}
                        mb={0.5}
                        // eslint-disable-next-line max-len
                        // eslint-disable-next-line no-nested-ternary
                        {...(proposalLayers.has(el.layer)
                          ? { colorScheme: 'green' }
                          : currentLayer > el.layer
                          ? { colorScheme: 'red' }
                          : { colorScheme: 'yellow' })}
                      >
                        {el.layer}
                      </Tag>
                    </Tooltip>
                  ))}
              </Box>
            </Box>
          )
        )}
        {Object.keys(eligibilities).length === 0 && (
          <Text fontSize="sm" color="gray.500">
            No eligible epochs and layers yet
          </Text>
        )}
      </Box>
      <Box w="40%">
        <Heading fontSize="sm">Rewards</Heading>
        {rewards.map((reward) => (
          <Box
            // eslint-disable-next-line max-len
            key={`Reward${id}_${reward.layerPaid}_${reward.smesher}`}
            my={2}
            p={3}
            borderWidth={1}
            borderStyle="solid"
            borderColor="brand.darkGray"
            borderRadius="lg"
          >
            <Text fontSize="sm" color="brand.green">
              +{formatSmidge(reward.rewardForLayer + reward.rewardForFees)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1} mb={0.5}>
              To: {reward.coinbase}
            </Text>
          </Box>
        ))}
        {rewards.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            No rewards yet
          </Text>
        )}
      </Box>
    </Flex>
  );
}

export default SmesherIdentityDetails;
