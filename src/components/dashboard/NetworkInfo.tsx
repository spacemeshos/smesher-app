import humanizeDuration from 'humanize-duration';

import { Code, Table, TableContainer } from '@chakra-ui/react';

import { Network } from '../../types/networks';
import { SECOND } from '../../utils/constants';
import { formatTimestamp } from '../../utils/datetime';
import TableContents from '../basic/TableContents';

function NetworkInfo({ data }: { data: Network }): JSX.Element {
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
            ['Genesis Time', formatTimestamp(data.genesisTime || 0)],
            [
              'Genesis ID',
              <Code display="inline" wordBreak="break-all" whiteSpace="normal">
                {data.genesisId}
              </Code>,
            ],
            ['Layer duration', humanizeDuration(data.layerDuration * SECOND)],
            ['Layers per epoch', data.layersPerEpoch],
            ['Effective genesis', data.effectiveGenesisLayer],
          ]}
        />
      </Table>
    </TableContainer>
  );
}

export default NetworkInfo;
