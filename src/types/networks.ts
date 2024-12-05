import { HexString } from './common';

export type Network = {
  hrp: string;
  genesisTime: number;
  genesisId: HexString;
  effectiveGenesisLayer: number;
  layerDuration: number; // Seconds
  layersPerEpoch: number;
  labelsPerUnit: string;
};

export type NodeStatus = {
  connectedPeers: number;
  isSynced: boolean;
  currentLayer: number;
  appliedLayer: number;
  processedLayer: number;
  latestLayer: number;
};
