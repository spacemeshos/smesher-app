import parse from 'parse-duration';

import { fromBase64 } from '../../utils/base64';
import fetchJSON from '../../utils/fetchJSON';
import { toHexString } from '../../utils/hexString';
import { parseResponse } from '../schemas/error';
import { NetworkInfoResponseSchema } from '../schemas/network';
import { NodeStatusSchema, NodeSyncStatus } from '../schemas/node';

export const fetchNetworkInfo = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2beta1.NetworkService/Info`, {
    method: 'GET',
  })
    .then(parseResponse(NetworkInfoResponseSchema))
    .then((res) => ({
      ...res,
      genesisId: toHexString(fromBase64(res.genesisId)),
      genesisTime: new Date(res.genesisTime).getTime(),
      layerDuration: (parse(res.layerDuration) || 0) / 1000,
    }));

export const fetchNodeStatus = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2beta1.NodeService/Status`, { method: 'GET' })
    .then(parseResponse(NodeStatusSchema))
    .then((status) => ({
      connectedPeers: parseInt(status.connectedPeers, 10),
      isSynced: status.status === NodeSyncStatus.SYNCED,
      currentLayer: status.currentLayer,
      appliedLayer: status.appliedLayer,
      processedLayer: status.processedLayer,
      latestLayer: status.latestLayer,
    }));
