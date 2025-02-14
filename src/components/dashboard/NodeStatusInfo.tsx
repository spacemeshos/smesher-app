import { Table, TableContainer } from '@chakra-ui/react';

import { Activations, NodeStatus } from '../../types/networks';
import TableContents from '../basic/TableContents';

function NodeStatusInfo({
  node,
  activations,
}: {
  node: NodeStatus;
  activations: Activations | null;
}): JSX.Element {
  return (
    <TableContainer>
      <Table size="sm" variant="unstyled">
        <TableContents
          tableKey="netInfo"
          tdProps={{
            _first: { pl: 0, w: '30%' },
            _last: { pr: 0 },
          }}
          data={[
            ['Sync status', node.isSynced ? 'Synced' : 'Not synced'],
            [
              'Processed layer',
              // eslint-disable-next-line max-len
              `${node.processedLayer} / ${node.currentLayer}`,
            ],
            ['Applied layer', node.appliedLayer],
            ['Latest layer', node.latestLayer],
            ['Connected peers', node.connectedPeers],
            [
              'Activations',
              activations === null
                ? 'Loading...'
                : activations.count.toString(),
            ],
          ]}
        />
      </Table>
    </TableContainer>
  );
}

export default NodeStatusInfo;
