import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  List,
  ListItem,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Text,
} from '@chakra-ui/react';

import StatusBulb, { getStatusByStore } from '../components/basic/StatusBulb';
import TableContents from '../components/basic/TableContents';
import NetworkInfo from '../components/dashboard/NetworkInfo';
import NodeStatusInfo from '../components/dashboard/NodeStatusInfo';
import OptionalError from '../components/dashboard/OptionalError';
// eslint-disable-next-line max-len
import SmesherIdentityDetails from '../components/dashboard/SmesherIdentityDetails';
import SmeshingTimeline from '../components/timeline/SmeshingTimeline';
import useTimelineData from '../hooks/useTimelineData';
import useActivations from '../store/useActivations';
import useEligibilities from '../store/useEligibilities';
import useNetworkInfo from '../store/useNetworkInfo';
import useNodeStatus from '../store/useNodeStatus';
import usePoETInfo from '../store/usePoETInfo';
import useProposals from '../store/useProposals';
import useRewards from '../store/useRewards';
import useSmesherConnection from '../store/useSmesherConnection';
import useSmesherStates from '../store/useSmesherStates';
import { HexString } from '../types/common';
import { sortHexString } from '../utils/hexString';
import { formatSmidge } from '../utils/smh';

function DashboardScreen(): JSX.Element {
  const { setConnection, getConnection, refreshConnection } =
    useSmesherConnection();
  const NetInfo = useNetworkInfo();
  const Node = useNodeStatus();
  const Activations = useActivations();
  const PoET = usePoETInfo();
  const SmesherStates = useSmesherStates();
  const Eligibilities = useEligibilities();
  const Proposals = useProposals();
  const Rewards = useRewards();
  const navigate = useNavigate();
  const data = useTimelineData();

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

  const [forceClosed, setForceClosed] = useState(false);

  return (
    <>
      <Modal
        isOpen={!SmesherStates.data?.isHistoryLoaded && !forceClosed}
        onClose={() => setForceClosed(true)}
        isCentered
        variant="dark"
      >
        <ModalOverlay />
        <ModalContent
          pointerEvents="none"
          textAlign="center"
          color="brand.lightGray"
          alignContent="center"
        >
          <Box textAlign="center">
            <Spinner speed="1.2s" size="xxl" color="brand.green" />
            <Text fontWeight="bold" fontSize={28} mt={10} color="brand.green">
              Loading smesher&apos;s data...
            </Text>
            <Text fontSize="sm" mt={3}>
              Click anywhere to hide the spinner and start using the app.
            </Text>
          </Box>
        </ModalContent>
      </Modal>
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
              {NetInfo.data && <NetworkInfo data={NetInfo.data} />}
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
                <NodeStatusInfo
                  node={Node.data}
                  activations={Activations.data}
                />
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
            {Object.keys(SmesherStates.data?.states || {})
              .sort(sortHexString)
              .map((id, index) => {
                const eligibilityStats = getEligibilityStats(id);
                const proposalStats = getProposalStats(id);
                const rewardStats = getRewardStats(id);
                return (
                  <AccordionItem key={`Accordion_${id}`}>
                    {({ isExpanded }) => (
                      <>
                        <AccordionButton px={0} fontSize="sm">
                          <Box flex="1" textAlign="left">
                            <Text mb={0.5}>
                              <Box
                                as="span"
                                className={`id-marker ${
                                  data.smesherMessages[id]?.type ?? ''
                                }`}
                                mr={1}
                              >
                                {index + 1}
                              </Box>
                              {data.smesherMessages[id]?.message ??
                                'Waiting for the smesher events...'}
                            </Text>

                            <Text mb={2} color="gray.300">
                              <Text as="span" fontSize="xs">
                                Smesher ID:
                              </Text>
                              0x{id}
                            </Text>

                            <Flex
                              flexDir={{ base: 'column', lg: 'row' }}
                              gap={{ base: 1, lg: 10 }}
                            >
                              <Text fontSize="xs" color="gray.500">
                                Eligible for{' '}
                                {/* eslint-disable-next-line max-len */}
                                <strong>
                                  {eligibilityStats.layers} layers
                                </strong>{' '}
                                <span>in {eligibilityStats.epochs} epochs</span>
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Published
                                <strong>{proposalStats} proposals</strong>
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {/* eslint-disable-next-line max-len */}
                                Earned <strong>
                                  {rewardStats.income}
                                </strong> in {rewardStats.rewards} rewards
                              </Text>
                            </Flex>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel px={0} pb={4}>
                          {isExpanded && (
                            <SmesherIdentityDetails
                              id={id}
                              eligibilities={Eligibilities.data?.[id]?.epochs}
                              proposals={Proposals.data?.[id]?.proposals}
                              rewards={Rewards.data?.[id]}
                              currentLayer={Node.data?.currentLayer ?? 0}
                            />
                          )}
                        </AccordionPanel>
                      </>
                    )}
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
