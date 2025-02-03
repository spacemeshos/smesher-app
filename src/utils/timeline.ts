import { EventName } from '../api/schemas/smesherEvents';
import { Network } from '../types/networks';
import { PoETConfig } from '../types/poet';

import { SECOND } from './constants';

export const getLayerByTime = (
  layerDuration: number,
  genesisTime: number,
  currentTime: number
): number => {
  const timeSinceGenesis = currentTime - genesisTime;
  return Math.floor(timeSinceGenesis / (layerDuration * SECOND));
};

export const getEpochByLayer = (layersPerEpoch: number, layer: number) =>
  Math.floor(layer / layersPerEpoch);

export const getEpochFirstLayer = (layersPerEpoch: number, epoch: number) =>
  epoch * layersPerEpoch;
export const getEpochLastLayer = (layersPerEpoch: number, epoch: number) =>
  getEpochFirstLayer(layersPerEpoch, epoch + 1) - 1;

// All times are in milliseconds
// and should be added to the Genesis Time
export const getLayerStartTime = (layerDuration: number, layer: number) =>
  layer * layerDuration * SECOND;
export const getLayerEndTime = (layerDuration: number, layer: number) =>
  getLayerStartTime(layerDuration, layer + 1) - 1;
export const getEpochStartTime = (
  layerDuration: number,
  layersPerEpoch: number,
  epoch: number
) =>
  getLayerStartTime(layerDuration, getEpochFirstLayer(layersPerEpoch, epoch));
export const getEpochEndTime = (
  layerDuration: number,
  layersPerEpoch: number,
  epoch: number
) => getLayerEndTime(layerDuration, getEpochLastLayer(layersPerEpoch, epoch));
export const getTimeToNextEpochStart = (
  layerDuration: number,
  layersPerEpoch: number,
  currentLayer: number
) => {
  const currentEpoch = getEpochByLayer(layersPerEpoch, currentLayer);
  const nextEpoch = currentEpoch + 1;
  const nextEpochStartsAtLayer = getEpochFirstLayer(layersPerEpoch, nextEpoch);
  return (nextEpochStartsAtLayer - currentLayer) * layerDuration * SECOND;
};
export const getEpochDuration = (
  layerDuration: number,
  layersPerEpoch: number
) => layersPerEpoch * layerDuration * SECOND;

export const getCycleGapStart = (
  poetConfig: PoETConfig,
  netInfo: Network,
  index: number
) => {
  const poetStart = netInfo.genesisTime + poetConfig.phaseShift;
  const epochDuration = getEpochDuration(
    netInfo.layerDuration,
    netInfo.layersPerEpoch
  );
  return poetStart - poetConfig.cycleGap + epochDuration * index;
};

export const getCycleGapEnd = (
  poetConfig: PoETConfig,
  netInfo: Network,
  index: number
) => getCycleGapStart(poetConfig, netInfo, index) + poetConfig.cycleGap;

export const getPoetRoundStart = (
  poetConfig: PoETConfig,
  netInfo: Network,
  index: number
) => {
  const epochDuration = getEpochDuration(
    netInfo.layerDuration,
    netInfo.layersPerEpoch
  );
  const poetStart = netInfo.genesisTime + poetConfig.phaseShift;
  return poetStart + epochDuration * index;
};

export const getPoetRoundEnd = (
  poetConfig: PoETConfig,
  netInfo: Network,
  index: number
) => {
  const epochDuration = getEpochDuration(
    netInfo.layerDuration,
    netInfo.layersPerEpoch
  );
  return getPoetRoundStart(poetConfig, netInfo, index) + epochDuration;
};

export const getPoetRoundByTime = (
  poetConfig: PoETConfig,
  netInfo: Network,
  time: number
) => {
  const epochDuration = getEpochDuration(
    netInfo.layerDuration,
    netInfo.layersPerEpoch
  );
  const poetStart = netInfo.genesisTime + poetConfig.phaseShift;
  return Math.floor((time - poetStart) / epochDuration);
};

// Stuff for UX
export const getSmesherEventTitle = (eventName: EventName) => {
  switch (eventName) {
    case EventName.WAIT_FOR_ATX_SYNCED:
      return 'Wait for ATX sync';
    case EventName.RETRYING:
      return 'Retrying...';

    case EventName.WAITING_FOR_POET_REGISTRATION_WINDOW:
      return 'Waiting for PoET registration';
    case EventName.POET_CHALLENGE_READY:
      return 'PoET challenge ready';
    case EventName.POET_REGISTERED:
      return 'Registered in PoET';
    case EventName.WAIT_FOR_POET_ROUND_END:
      return 'Wait for PoET round end';
    case EventName.POET_PROOF_RECEIVED:
      return 'PoET proof received';

    case EventName.GENERATING_POST_PROOF:
      return 'Generating PoST proof...';
    case EventName.POST_PROOF_READY:
      return 'PoST proof is ready';

    case EventName.ATX_READY:
      return 'ATX is ready';
    case EventName.ATX_BROADCASTED:
      return 'ATX is broadcasted';

    case EventName.PROPOSAL_PUBLISHED:
      return 'Proposal published';
    case EventName.PROPOSAL_PUBLISH_FAILED:
      return 'Proposal publish failed';
    case EventName.PROPOSAL_BUILD_FAILED:
      return 'Proposal build failed';
    case EventName.ELIGIBLE:
      return 'Eligibility calculated';
    case EventName.UNSPECIFIED:
    default:
      return 'Unknown event';
  }
};
