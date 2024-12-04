import { Link as RLink } from 'react-router-dom';

import { Box, Button, Divider, Flex, FormLabel, Input, Link, Text } from '@chakra-ui/react';

import useSmesherConnection from '../store/useSmesherConnection';
import useNetworkInfo from '../store/useNetworkInfo';
import useNodeStatus from '../store/useNodeStatus';
import usePoETInfo from '../store/usePoETInfo';
import useSmesherStates from '../store/useSmesherStates';
import useEligibilities from '../store/useEligibilities';
import useProposals from '../store/useProposals';

const OptionalError = ({ store } : { store: { error: Error | null } }) => {
  if (!store.error)
    return null;

  return (
    <Text color="red.500">
      {store.error.message}
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

  return (
    <Flex flexDir="column" alignItems="flex-start" minH="80vh" w="100%">
      <Box mb={2}>
        Smesher Service is connected: {getConnection()}
        <Link
          as={RLink}
          color="brand.red"
          to="/"
        >
          [Disconnect]
        </Link>
      </Box>
      <Divider />

      <Flex flexDir={{ base: 'column', md: 'row' }} gap={{ base: 4, md: 20 }} w="100%">
        <Box mb={2}>
          Network Info
          <OptionalError store={NetInfo} />
          <pre>
            {JSON.stringify(NetInfo.info, null, 2)}
          </pre>
        </Box>
      
        <Box mb={2}>
          Node Info
          <OptionalError store={Node} />
          <pre>
            {JSON.stringify(Node.status, null, 2)}
          </pre>
        </Box>
      </Flex>
      <Divider />

      <Box mb={2}>
        PoETs
        <OptionalError store={PoET} />
        <pre>
          {JSON.stringify(PoET.info, null, 2)}
        </pre>
      </Box>

      <Box mb={2}>
        Smesher States
        <OptionalError store={SmesherStates} />
        <pre>
          {JSON.stringify(SmesherStates.ids, null, 2)}
        </pre>
      </Box>

      <Box mb={2}>
        Eligibilities
        <OptionalError store={Eligibilities} />
        <pre>
          {JSON.stringify(Eligibilities.ids, null, 2)}
        </pre>
      </Box>
      <Divider />

      <Box mb={2}>
        Proposals
        <OptionalError store={Proposals} />
        <pre>
          {JSON.stringify(Proposals.ids, null, 2)}
        </pre>
      </Box>
      <Divider />
    </Flex>
  );
}

export default DashboardScreen;
