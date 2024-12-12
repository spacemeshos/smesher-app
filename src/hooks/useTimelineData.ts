import { useEffect, useMemo, useRef } from 'react';
import { DataSet } from 'vis-data';
import { DataItem } from 'vis-timeline';

import { usePrevious } from '@chakra-ui/react';

import useNetworkInfo from '../store/useNetworkInfo';
import useNodeStatus from '../store/useNodeStatus';
import usePoETInfo from '../store/usePoETInfo';
import useSmesherStates from '../store/useSmesherStates';
import {
  getCurrentEpochByLayer,
  getEpochDuration,
  getEpochEndTime,
  getEpochStartTime,
  getLayerEndTime,
  getLayerStartTime,
} from '../utils/timeline';
import { SmesherState } from '../api/schemas/smesherStates';

const getHash = (item: DataItem) =>
  `${item.id}-${item.start}-${item.end}-${item.content}`;

const useTimelineData = () => {
  const { data: netInfo } = useNetworkInfo();
  const { data: nodeStatus } = useNodeStatus();
  const { data: poetInfo } = usePoETInfo();
  const { data: smesherStates } = useSmesherStates();
  const dataSetRef = useRef(new DataSet<DataItem>());

  const currentEpoch =
    netInfo && nodeStatus
      ? getCurrentEpochByLayer(netInfo.layersPerEpoch, nodeStatus.currentLayer)
      : 0;

  const epochDuration = netInfo
    ? getEpochDuration(netInfo.layerDuration, netInfo.layersPerEpoch)
    : 0;

  const currentEpochStartTime = netInfo
    ? getEpochStartTime(
        netInfo.layerDuration,
        netInfo.layersPerEpoch,
        currentEpoch
      )
    : 0;

  const epochsToDisplay = currentEpoch + 5;

  const epochs = useMemo<DataItem[]>(() => {
    if (!netInfo) {
      return <DataItem[]>[];
    }
    return new Array(epochsToDisplay).fill(null).map(
      (_, index): DataItem => ({
        content: `Epoch ${index}`,
        id: `epoch_${index}`,
        group: 'epochs',
        start:
          getEpochStartTime(
            netInfo.layerDuration,
            netInfo.layersPerEpoch,
            index
          ) + netInfo.genesisTime,
        end:
          getEpochEndTime(
            netInfo.layerDuration,
            netInfo.layersPerEpoch,
            index
          ) + netInfo.genesisTime,
        // TODO: Color epochs by it's status: general / failed / eligible
        className: 'epoch',
      })
    );
  }, [netInfo, epochsToDisplay]);

  const layers = useMemo<DataItem[]>(() => {
    if (!netInfo) {
      return <DataItem[]>[];
    }

    const layersToDisplay = epochsToDisplay * netInfo.layersPerEpoch;
    return new Array(layersToDisplay).fill(null).map(
      (_, index): DataItem => ({
        content: `${index}`,
        id: `layer_${index}`,
        group: 'layers',
        start:
          getLayerStartTime(netInfo.layerDuration, index) + netInfo.genesisTime,
        end:
          getLayerEndTime(netInfo.layerDuration, index) + netInfo.genesisTime,
        // TODO: Color layers with estimated or received rewards
        className: 'layer',
      })
    );
  }, [netInfo, epochsToDisplay]);

  const poetRounds = useMemo<DataItem[]>(() => {
    if (!netInfo || !poetInfo) {
      return <DataItem[]>[];
    }

    const poetStart = netInfo.genesisTime + poetInfo.config.phaseShift;

    const cycleGaps = new Array(epochsToDisplay)
      .fill(null)
      .map((_, index): DataItem => {
        const start =
          poetStart - poetInfo.config.cycleGap + epochDuration * index;
        const end = start + poetInfo.config.cycleGap;
        return {
          content: `CycleGap ${index}`,
          id: `poet_cycle_gap_${index}`,
          group: 'poet',
          subgroup: 'cycleGap',
          start,
          end,
          className: 'cycle-gap', // TODO: color by status
        };
      });

    const rounds = new Array(epochsToDisplay)
      .fill(null)
      .map((_, index): DataItem => {
        const start = poetStart + epochDuration * index;
        const end = start + epochDuration;
        return {
          content: `PoET Round ${index}`,
          id: `poet_round_${index}`,
          group: 'poet',
          subgroup: 'round',
          start,
          end,
          className: 'poet-round', // TODO: color by status
        };
      });

    return [...cycleGaps, ...rounds];
  }, [epochDuration, epochsToDisplay, netInfo, poetInfo]);

  const nestedEventGroups = useMemo(() => {
    const ids = Object.keys(smesherStates || {});
    return ids.length > 1 ? ids : [];
  }, [smesherStates]);

  const events = useMemo<DataItem[]>(() => {
    if (!smesherStates) {
      return <DataItem[]>[];
    }

    const entries = Object.entries(smesherStates);

    return entries.flatMap(([id, { history }]) => {
      const group = entries.length > 1 ? `smesher_${id}` : 'events';
      const items = history.map((item) => ({
        content: item.state,
        id: `smeshing_${id}_${item.state}_${item.time}`,
        group,
        subgroup: item.state,
        start: new Date(item.time).getTime(),
        type: 'point',
        className:
          item.state === SmesherState.RETRYING ||
          item.state === SmesherState.PROPOSAL_PUBLISH_FAILED
            ? 'smesher-event failure'
            : 'smesher-event',
      }));

      return items;
    });
  }, [smesherStates]);

  const items = useMemo<DataItem[]>(
    () => [...epochs, ...layers, ...poetRounds, ...events],
    [epochs, events, layers, poetRounds]
  );

  const hash = useMemo(() => new Set(items.map(getHash)), [items]);
  const prevHashes = usePrevious(hash);

  useEffect(() => {
    if (dataSetRef.current) {
      // TODO: Replace with better API calls instead of filtering on the client
      const newItems = items.filter((i) => !prevHashes.has(getHash(i)));
      dataSetRef.current.add(newItems);
    }
  }, [dataSetRef, items, prevHashes]);

  return {
    currentEpoch,
    currentEpochStartTime,
    genesisTime: netInfo?.genesisTime,
    epochDuration,
    epochs,
    layers,
    items: dataSetRef.current,
    nestedEventGroups,
  };
};

export default useTimelineData;
