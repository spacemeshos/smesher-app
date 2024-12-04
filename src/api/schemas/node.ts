import * as z from 'zod';

import { BigIntStringSchema } from './strNumber';

export enum NodeSyncStatus {
  UNSPECIFIED = 'SYNC_STATUS_UNSPECIFIED',
  OFFLINE = 'SYNC_STATUS_OFFLINE',
  SYNCING = 'SYNC_STATUS_SYNCING',
  SYNCED = 'SYNC_STATUS_SYNCED',
}

export const NodeStatusSchema = z.object({
  connectedPeers: BigIntStringSchema,
  status: z.nativeEnum(NodeSyncStatus),
  latestLayer: z.number(), // latest layer node has seen from blocks
  appliedLayer: z.number(), // last layer node has applied to the state
  processedLayer: z.number(), // last layer whose votes have been processed
  currentLayer: z.number(), // current layer, based on clock time
});
