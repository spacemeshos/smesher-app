import { SECOND } from './constants';

export const getCurrentEpochByLayer = (
  layersPerEpoch: number,
  curLayer: number
) => Math.floor(curLayer / layersPerEpoch);

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
) =>
  getLayerEndTime(layerDuration, getEpochLastLayer(layersPerEpoch, epoch));
export const getTimeToNextEpochStart = (
  layerDuration: number,
  layersPerEpoch: number,
  currentLayer: number
) => {
  const currentEpoch = getCurrentEpochByLayer(layersPerEpoch, currentLayer);
  const nextEpoch = currentEpoch + 1;
  const nextEpochStartsAtLayer = getEpochFirstLayer(layersPerEpoch, nextEpoch);
  return (nextEpochStartsAtLayer - currentLayer) * layerDuration * SECOND;
};
export const getEpochDuration = (
  layerDuration: number,
  layersPerEpoch: number
) => layersPerEpoch * layerDuration * SECOND;
