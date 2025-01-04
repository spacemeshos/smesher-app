import humanizeDuration from 'humanize-duration';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Code,
  Divider,
  Flex,
  Heading,
  List,
  ListItem,
  Table,
  TableContainer,
  Tag,
  Text,
  Tooltip,
} from '@chakra-ui/react';

import StatusBulb, { getStatusByStore } from '../components/basic/StatusBulb';
import TableContents from '../components/basic/TableContents';
import SmeshingTimeline from '../components/timeline/SmeshingTimeline';
import useEligibilities from '../store/useEligibilities';
import useNetworkInfo from '../store/useNetworkInfo';
import useNodeStatus from '../store/useNodeStatus';
import usePoETInfo from '../store/usePoETInfo';
import useProposals from '../store/useProposals';
import useRewards from '../store/useRewards';
import useSmesherConnection from '../store/useSmesherConnection';
import useSmesherStates from '../store/useSmesherStates';
import { HexString } from '../types/common';
import { SECOND } from '../utils/constants';
import { formatTimestamp } from '../utils/datetime';
import { formatSmidge } from '../utils/smh';

function OptionalError({
  store,
  prefix = '',
}: {
  store: { error: Error | null };
  prefix?: string;
}) {
  if (!store.error) return null;

  return (
    <Text color="red.500">
      {prefix}
      {store.error.message}
    </Text>
  );
}

function DashboardScreen(): JSX.Element {
  const { setConnection, getConnection, refreshConnection } =
    useSmesherConnection();
  const NetInfo = useNetworkInfo();
  const Node = useNodeStatus();
  const PoET = usePoETInfo();
  const SmesherStates = useSmesherStates();
  const Eligibilities = useEligibilities();
  const Proposals = useProposals();
  const Rewards = useRewards();
  const navigate = useNavigate();

  const disconnect = () => {
    setConnection('');
    navigate('/');
  };

  const nodeStatusStore = getStatusByStore(Node);
  const nodeStatusBulb =
    // eslint-disable-next-line no-nested-ternary
    nodeStatusStore !== 'ok'
      ? nodeStatusStore
      : Node.data?.isSynced
      ? 'ok'
      : 'pending';

  const getEligibilityStats = useCallback(
    (id: HexString) => {
      if (!Eligibilities.data) {
        return { epochs: '??', layers: '??' };
      }

      const epochs = Eligibilities.data[id]?.epochs ?? {};
      const epochsAmount = Object.keys(epochs).length;
      const layers = new Set(
        Object.values(epochs || {}).flatMap((next) =>
          next.eligibilities.map((el) => el.layer)
        )
      );

      return { epochs: String(epochsAmount), layers: String(layers.size) };
    },
    [Eligibilities.data]
  );

  const getProposalStats = useCallback(
    (id: HexString) => {
      if (!Proposals.data) {
        return 0;
      }

      const proposals = Proposals.data[id]?.proposals ?? [];
      return proposals.length;
    },
    [Proposals.data]
  );
  const getRewardStats = useCallback(
    (id: HexString) => {
      if (!Rewards.data) {
        return { rewards: '??', income: '?? SMH' };
      }

      const rewards = Rewards.data[id] ?? [];
      const totalIncome = rewards.reduce(
        (acc, next) => acc + next.rewardForFees + next.rewardForLayer,
        0n
      );
      return { rewards: rewards.length, income: formatSmidge(totalIncome) };
    },
    [Rewards.data]
  );

  const getPublishedProposalLayers = useCallback(
    (id: HexString) => {
      if (!Proposals.data) {
        return new Set();
      }
      const proposals = Proposals.data[id]?.proposals ?? [];
      return new Set(proposals.map((proposal) => proposal.layer));
    },
    [Proposals.data]
  );

  return (
    <>
      <Flex
        grow={1}
        w="100%"
        flexDir="column"
        alignItems="flex-start"
        overflow="auto"
      >
        <Box mb={2} w="100%">
          <StatusBulb status={getStatusByStore(NetInfo)} mr={2} />
          Connected to {getConnection()}
          {NetInfo.error && (
            <Button
              variant="link"
              fontWeight="normal"
              color="brand.green"
              ml={2}
              onClick={refreshConnection}
            >
              [Refresh]
            </Button>
          )}
          <Button
            variant="link"
            fontWeight="normal"
            color="brand.red"
            ml={2}
            onClick={disconnect}
          >
            [Disconnect]
          </Button>
        </Box>
        <Divider />

        <Accordion w="100%" allowMultiple>
          <AccordionItem>
            <AccordionButton px={0} fontSize="sm">
              <Box as="span" flex="1" textAlign="left">
                <StatusBulb status={getStatusByStore(NetInfo)} mr={2} />
                Network Info
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={6} pb={4}>
              <OptionalError store={NetInfo} />
              {NetInfo.data && (
                <TableContainer>
                  <Table size="sm" variant="unstyled">
                    <TableContents
                      tableKey="netInfo"
                      tdProps={{
                        _first: { pl: 0, w: '30%' },
                        _last: { pr: 0 },
                      }}
                      data={[
                        [
                          'Genesis Time',
                          formatTimestamp(NetInfo.data.genesisTime || 0),
                        ],
                        [
                          'Genesis ID',
                          <Code
                            display="inline"
                            wordBreak="break-all"
                            whiteSpace="normal"
                          >
                            {NetInfo.data.genesisId}
                          </Code>,
                        ],
                        [
                          'Layer duration',
                          humanizeDuration(NetInfo.data.layerDuration * SECOND),
                        ],
                        ['Layers per epoch', NetInfo.data.layersPerEpoch],
                        [
                          'Effective genesis',
                          NetInfo.data.effectiveGenesisLayer,
                        ],
                      ]}
                    />
                  </Table>
                </TableContainer>
              )}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton px={0} fontSize="sm">
              <Box as="span" flex="1" textAlign="left">
                <StatusBulb status={nodeStatusBulb} mr={2} />
                Node Status
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={6} pb={4}>
              <OptionalError store={Node} />
              {Node.data && (
                <TableContainer>
                  <Table size="sm" variant="unstyled">
                    <TableContents
                      tableKey="netInfo"
                      tdProps={{
                        _first: { pl: 0, w: '30%' },
                        _last: { pr: 0 },
                      }}
                      data={[
                        [
                          'Sync status',
                          Node.data.isSynced ? 'Synced' : 'Not synced',
                        ],
                        [
                          'Processed layer',
                          // eslint-disable-next-line max-len
                          `${Node.data.processedLayer} / ${Node.data.currentLayer}`,
                        ],
                        ['Applied layer', Node.data.appliedLayer],
                        ['Latest layer', Node.data.latestLayer],
                        ['Connected peers', Node.data.connectedPeers],
                      ]}
                    />
                  </Table>
                </TableContainer>
              )}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton px={0} fontSize="sm">
              <Box as="span" flex="1" textAlign="left">
                <StatusBulb status={getStatusByStore(PoET)} mr={2} />
                PoET servers
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={6} pb={4}>
              <OptionalError store={PoET} />
              {PoET.data && (
                <TableContainer>
                  <Table size="sm" variant="unstyled">
                    <TableContents
                      tableKey="netInfo"
                      tdProps={{
                        _first: { pl: 0, w: '30%' },
                        _last: { pr: 0 },
                      }}
                      data={[
                        [
                          'Servers',
                          <List styleType="circle">
                            {PoET.data.poets.map((server, i) => (
                              // eslint-disable-next-line max-len
                              // eslint-disable-next-line react/no-array-index-key
                              <ListItem key={`poet_servers_${i}_${server}`}>
                                {server}
                              </ListItem>
                            ))}
                          </List>,
                        ],
                        ['Phase Shift', PoET.data.config.phaseShift],
                        ['Cycle Gap', PoET.data.config.cycleGap],
                      ]}
                    />
                  </Table>
                </TableContainer>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Box mb={2} mt={6} w="100%">
          <Heading size="md">Identities</Heading>

          <OptionalError store={SmesherStates} prefix="States: " />
          <OptionalError store={Eligibilities} prefix="Eligibilities: " />
          <OptionalError store={Proposals} prefix="Proposals: " />

          <Accordion w="100%" defaultIndex={[]} allowToggle>
            {Object.keys(SmesherStates.data || {}).map((id) => {
              const eligibilityStats = getEligibilityStats(id);
              const proposalStats = getProposalStats(id);
              const rewardStats = getRewardStats(id);
              return (
                <AccordionItem key={`Accordion_${id}`}>
                  <AccordionButton px={0} fontSize="sm">
                    <Box flex="1" textAlign="left">
                      <Text mb={1}>
                        <Text as="span" fontSize="xs">
                          Smesher ID:
                        </Text>
                        0x{id}
                      </Text>

                      <Text fontSize="xs" color="gray.500">
                        Eligible for{' '}
                        <strong>{eligibilityStats.layers} layers</strong>{' '}
                        <span>in {eligibilityStats.epochs} epochs</span>
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Published <strong>{proposalStats} proposals</strong>
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Earned <strong>{rewardStats.income}</strong> in{' '}
                        {rewardStats.rewards} rewards
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} pb={4}>
                    <Flex w="100%" justifyContent="space-between" mb={2}>
                      <Box w="55%">
                        <Heading fontSize="sm">Eligibilities</Heading>
                        {Object.entries(
                          Eligibilities.data?.[id]?.epochs ?? {}
                        ).map(([epoch, { eligibilities }]) => {
                          const proposals = getPublishedProposalLayers(id);
                          return (
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
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={1}
                                mb={0.5}
                              >
                                Layers
                              </Text>
                              <Box lineHeight={0}>
                                {eligibilities
                                  .sort((a, b) => a.layer - b.layer)
                                  .map((el) => (
                                    <Tooltip
                                      label={
                                        <>
                                          <Text fontSize="xs">
                                            Layer: {el.layer}
                                          </Text>
                                          <Text fontSize="xs" mb={1}>
                                            Weight: {el.count}
                                          </Text>
                                          {proposals.has(el.layer) && (
                                            <Text
                                              color="brand.darkGreen"
                                              fontSize="xs"
                                            >
                                              Published:{' '}
                                              {Proposals.data?.[
                                                id
                                              ]?.proposals?.find(
                                                (p) => p.layer === el.layer
                                              )?.proposal ?? ''}
                                            </Text>
                                          )}
                                        </>
                                      }
                                      // eslint-disable-next-line max-len
                                      key={`Eligibility_${id}_${epoch}_${el.layer}`}
                                    >
                                      <Tag
                                        size="sm"
                                        mr={0.5}
                                        mb={0.5}
                                        {...(proposals.has(el.layer)
                                          ? { colorScheme: 'green' }
                                          : {})}
                                      >
                                        {el.layer}
                                      </Tag>
                                    </Tooltip>
                                  ))}
                              </Box>
                            </Box>
                          );
                        })}
                        {(!Eligibilities.data?.[id] ||
                          Object.keys(Eligibilities.data?.[id] ?? {}).length ===
                            0) && (
                          <Text fontSize="sm" color="gray.500">
                            No eligible epochs and layers yet
                          </Text>
                        )}
                      </Box>
                      <Box w="40%">
                        <Heading fontSize="sm">Rewards</Heading>
                        {(Rewards.data?.[id] ?? []).map((reward) => (
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
                              +
                              {formatSmidge(
                                reward.rewardForLayer + reward.rewardForFees
                              )}
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                mt={1}
                                mb={0.5}
                              >
                                To: {reward.coinbase}
                              </Text>
                            </Text>
                          </Box>
                        ))}
                        {(Rewards.data?.[id] ?? []).length === 0 && (
                          <Text fontSize="sm" color="gray.500">
                            No rewards yet
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Box>
      </Flex>
      <SmeshingTimeline />
    </>
  );
}

export default DashboardScreen;
