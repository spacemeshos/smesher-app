import humanizeDuration from 'humanize-duration';
import { Link as RLink } from 'react-router-dom';

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
  Link,
  List,
  ListItem,
  Table,
  TableContainer,
  Text,
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
import { SECOND } from '../utils/constants';
import { formatTimestamp } from '../utils/datetime';

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
  const { getConnection, refreshConnection } = useSmesherConnection();
  const NetInfo = useNetworkInfo();
  const Node = useNodeStatus();
  const PoET = usePoETInfo();
  const SmesherStates = useSmesherStates();
  const Eligibilities = useEligibilities();
  const Proposals = useProposals();
  const Rewards = useRewards();

  const nodeStatusStore = getStatusByStore(Node);
  const nodeStatusBulb =
    // eslint-disable-next-line no-nested-ternary
    nodeStatusStore !== 'ok'
      ? nodeStatusStore
      : Node.data?.isSynced
      ? 'ok'
      : 'pending';

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
              as={RLink}
              variant="link"
              fontWeight="normal"
              color="brand.green"
              ml={2}
              onClick={refreshConnection}
            >
              [Refresh]
            </Button>
          )}
          <Link as={RLink} color="brand.red" to="/" ml={2}>
            [Disconnect]
          </Link>
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
            {Object.entries(SmesherStates.data || {}).map(
              ([id, { history }]) => (
                <AccordionItem key={`Accordion_${id}`}>
                  <AccordionButton px={0} fontSize="sm">
                    <Box as="span" flex="1" textAlign="left">
                      {id}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} pb={4}>
                    <Flex w="100%" justifyContent="space-between" mb={2}>
                      <Box w="50%">
                        <Heading fontSize="sm">History</Heading>
                        <pre style={{ fontSize: '12px' }}>
                          {JSON.stringify(history, null, 2)}
                        </pre>
                      </Box>
                      <Box w="25%">
                        <Heading fontSize="sm">Eligibilities</Heading>
                        <pre style={{ fontSize: '12px' }}>
                          {JSON.stringify(
                            Eligibilities?.data?.[id] || {},
                            null,
                            2
                          )}
                        </pre>
                        <Divider />
                        <Heading fontSize="sm">Proposals</Heading>
                        <pre style={{ fontSize: '12px' }}>
                          {JSON.stringify(Proposals?.data?.[id] || {}, null, 2)}
                        </pre>
                      </Box>
                      <Box w="35%">
                        <Heading fontSize="sm">Rewards</Heading>
                        <pre style={{ fontSize: '12px' }}>
                          {JSON.stringify(Rewards?.data?.[id] || {}, null, 2)}
                        </pre>
                      </Box>
                    </Flex>
                  </AccordionPanel>
                </AccordionItem>
              )
            )}
          </Accordion>
        </Box>
      </Flex>
      <SmeshingTimeline />
    </>
  );
}

export default DashboardScreen;
