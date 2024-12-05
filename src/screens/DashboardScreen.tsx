import { Link as RLink } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Code, Divider, Flex, FormLabel, Heading, Input, Link, List, ListItem, Table, TableContainer, Text } from '@chakra-ui/react';

import useSmesherConnection from '../store/useSmesherConnection';
import useNetworkInfo from '../store/useNetworkInfo';
import useNodeStatus from '../store/useNodeStatus';
import usePoETInfo from '../store/usePoETInfo';
import useSmesherStates from '../store/useSmesherStates';
import useEligibilities from '../store/useEligibilities';
import useProposals from '../store/useProposals';
import StatusBulb, { getStatusByStore } from '../components/basic/StatusBulb';
import { formatTimestamp } from '../utils/datetime';
import TableContents from '../components/basic/TableContents';
import { SECOND } from '../utils/constants';
import { A } from '@mobily/ts-belt';

const OptionalError = ({ store, prefix } : { store: { error: Error | null }, prefix?: string }) => {
  if (!store.error)
    return null;

  return (
    <Text color="red.500">
      {prefix}{store.error.message}
    </Text>
  )
};

function DashboardScreen(): JSX.Element {
  const { getConnection } = useSmesherConnection();
  const NetInfo = useNetworkInfo();
  const Node = useNodeStatus();
  const PoET = usePoETInfo();
  const SmesherStates = useSmesherStates();
  const Eligibilities = useEligibilities();
  const Proposals = useProposals();

  const nodeStatusStore = getStatusByStore(Node);
  const nodeStatusBulb = nodeStatusStore !== 'ok'
    ? nodeStatusStore
    : Node.data?.isSynced
    ? 'ok'
    : 'pending';

  return (
    <Flex flexDir="column" alignItems="flex-start" minH="80vh" w="100%">
      <Box mb={2} w="100%">
        <StatusBulb status={getStatusByStore(Node)} mr={2} />
        Connected to {getConnection()}
        <Link
          as={RLink}
          color="brand.red"
          to="/"
          ml={2}
        >
          [Disconnect]
        </Link>
      </Box>
      <Divider />

      <Accordion w="100%" allowMultiple>
        <AccordionItem>
          <AccordionButton px={0} fontSize="sm">
            <Box  as='span' flex='1' textAlign='left'>
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
                    tdProps={{ _first: { pl: 0, w: '30%' }, _last: { pr: 0 } }}
                    data={[
                      ['Genesis Time', formatTimestamp(NetInfo.data.genesisTime || 0)],
                      [
                        'Genesis ID',
                        <Code display="inline" wordBreak="break-all" whiteSpace="normal">
                          {NetInfo.data.genesisId}
                        </Code>,
                      ],
                      ['Layer duration', humanizeDuration(NetInfo.data.layerDuration * SECOND)],
                      ['Layers per epoch', NetInfo.data.layersPerEpoch],
                      ['Effective genesis', NetInfo.data.effectiveGenesisLayer]
                    ]}
                  />
                </Table>
              </TableContainer>
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton px={0} fontSize="sm">
            <Box  as='span' flex='1' textAlign='left'>
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
                    tdProps={{ _first: { pl: 0, w: '30%' }, _last: { pr: 0 } }}
                    data={[
                      ['Sync status', Node.data.isSynced ? 'Synced' : 'Not synced'],
                      ['Processed layer', `${Node.data.processedLayer} / ${Node.data.currentLayer}`],
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
            <Box  as='span' flex='1' textAlign='left'>
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
                    tdProps={{ _first: { pl: 0, w: '30%' }, _last: { pr: 0 } }}
                    data={[
                      [
                        'Servers',
                        <List styleType="circle">
                          {PoET.data.poets.map((server, i) => (
                            <ListItem key={`poet_servers_${i}`}>
                              {server}
                            </ListItem>
                          ))}
                        </List>,
                      ],
                      [
                        'Phase Shift',
                        PoET.data.config.phaseShift,
                      ],
                      [
                        'Cycle Gap',
                        PoET.data.config.cycleGap,
                      ],
                    ]}
                  />
                </Table>
              </TableContainer>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Box mb={2} mt={6} w="100%">
        <Heading size="md">
          Identities
        </Heading>

        <OptionalError store={SmesherStates} prefix="States: " />
        <OptionalError store={Eligibilities} prefix="Eligibilities: " />
        <OptionalError store={Proposals} prefix="Proposals: " />

        <Accordion w="100%" defaultIndex={[0]} allowToggle>
          {(Object.entries(SmesherStates.data || {}).map(([id, { history }], i) =>
            <AccordionItem>
              <AccordionButton px={0} fontSize="sm">
                <Box  as='span' flex='1' textAlign='left'>
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
                      {JSON.stringify(Eligibilities?.data?.[id] || {}, null, 2)}
                    </pre>
                  </Box>
                  <Box w="35%">
                    <Heading fontSize="sm">Proposals</Heading>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(Proposals?.data?.[id] || {}, null, 2)}
                    </pre>
                  </Box>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </Flex>
  );
}

export default DashboardScreen;
