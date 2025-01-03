import { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet } from 'vis-data';
import { DataItem } from 'vis-timeline';

import { usePrevious } from '@chakra-ui/react';

import * as SmesherEvents from '../api/schemas/smesherEvents';
import useNetworkInfo from '../store/useNetworkInfo';
import usePoETInfo from '../store/usePoETInfo';
import useSmesherStates from '../store/useSmesherStates';
import {
  AnyTimelineDetails,
  CycleGapDetails,
  EpochDetails,
  EventDetails,
  LayerDetails,
  PoetRoundDetails,
  TimelineItem,
  TimelineItemType,
} from '../types/timeline';
import { SECOND } from '../utils/constants';
import { noop } from '../utils/func';
import {
  getCurrentEpochByLayer,
  getEpochDuration,
  getEpochEndTime,
  getEpochStartTime,
  getLayerByTime,
  getLayerEndTime,
  getLayerStartTime,
  getSmesherEventTitle,
} from '../utils/timeline';

const getHash = (item: DataItem) =>
  `${item.id}-${item.start}-${item.end}-${item.content}`;

const useTimelineData = () => {
  const { data: netInfo } = useNetworkInfo();
  const { data: poetInfo } = usePoETInfo();
  const { data: smesherStates } = useSmesherStates();
  const dataSetRef = useRef(new DataSet<TimelineItem>());

  //
  // Update current time once per layer
  //
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    if (netInfo) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, netInfo.layerDuration * SECOND);
      return () => clearInterval(interval);
    }
    return noop;
  }, [netInfo]);

  //
  // Calculate layers and epochs
  //
  const layerByTime = netInfo
    ? getLayerByTime(netInfo.layerDuration, netInfo.genesisTime, currentTime)
    : 0;
  const currentEpoch = netInfo
    ? getCurrentEpochByLayer(netInfo.layersPerEpoch, layerByTime)
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

  //
  // Compute data for the timeline
  //
  const epochs = useMemo<TimelineItem<EpochDetails>[]>(() => {
    if (!netInfo) {
      return <TimelineItem<EpochDetails>[]>[];
    }
    return new Array(epochsToDisplay).fill(null).map(
      (_, index): TimelineItem<EpochDetails> => ({
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
        data: {
          title: `Epoch ${index}`,
          type: TimelineItemType.Epoch,
        },
      })
    );
  }, [netInfo, epochsToDisplay]);

  const layers = useMemo<TimelineItem<LayerDetails>[]>(() => {
    if (!netInfo) {
      return <TimelineItem<LayerDetails>[]>[];
    }

    const layersToDisplay = epochsToDisplay * netInfo.layersPerEpoch;
    return new Array(layersToDisplay).fill(null).map(
      (_, index): TimelineItem<LayerDetails> => ({
        content: `${index}`,
        id: `layer_${index}`,
        group: 'layers',
        start:
          getLayerStartTime(netInfo.layerDuration, index) + netInfo.genesisTime,
        end:
          getLayerEndTime(netInfo.layerDuration, index) + netInfo.genesisTime,
        // TODO: Color layers with estimated or received rewards
        className: 'layer',
        data: {
          title: `Layer ${index}`,
          type: TimelineItemType.Layer,
        },
      })
    );
  }, [netInfo, epochsToDisplay]);

  const poetRounds = useMemo<
    TimelineItem<PoetRoundDetails | CycleGapDetails>[]
  >(() => {
    if (!netInfo || !poetInfo) {
      return <TimelineItem<PoetRoundDetails>[]>[];
    }

    const poetStart = netInfo.genesisTime + poetInfo.config.phaseShift;

    const cycleGaps = new Array(epochsToDisplay)
      .fill(null)
      .map((_, index): TimelineItem<CycleGapDetails> => {
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
          data: {
            title: `CycleGap ${index}`,
            type: TimelineItemType.CycleGap,
          },
        };
      });

    const rounds = new Array(epochsToDisplay)
      .fill(null)
      .map((_, index): TimelineItem<PoetRoundDetails> => {
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
          data: {
            title: `PoET Round #${index}`,
            type: TimelineItemType.PoetRound,
          },
        };
      });

    return [...cycleGaps, ...rounds];
  }, [epochDuration, epochsToDisplay, netInfo, poetInfo]);

  const nestedEventGroups = useMemo(() => {
    const ids = Object.keys(smesherStates || {});
    return ids.length > 1 ? ids : [];
  }, [smesherStates]);

  const events = useMemo<TimelineItem<SmesherEvents.AnyEventDetails>[]>(() => {
    if (!smesherStates) {
      return <TimelineItem<EventDetails>[]>[];
    }

    const entries = Object.entries(smesherStates);

    return entries.flatMap(([id, { history }]) => {
      const group = entries.length > 1 ? `smesher_${id}` : 'events';
      const items = history.map((item) => ({
        content: getSmesherEventTitle(item.state),
        id: `smeshing_${id}_${item.state}_${item.time}`,
        group,
        subgroup: item.state,
        start: new Date(item.time).getTime(),
        type: 'point',
        className:
          item.state === SmesherEvents.EventName.RETRYING ||
          item.state === SmesherEvents.EventName.PROPOSAL_BUILD_FAILED ||
          item.state === SmesherEvents.EventName.PROPOSAL_PUBLISH_FAILED
            ? 'smesher-event failure'
            : 'smesher-event',
        data: {
          title: getSmesherEventTitle(item.state),
          type: TimelineItemType.Event,
          details: SmesherEvents.pickSmesherEventDetails(item),
        },
      }));

      return items;
    });
  }, [smesherStates]);

  const items = useMemo<TimelineItem<AnyTimelineDetails>[]>(
    () => [...epochs, ...layers, ...poetRounds, ...events],
    [epochs, events, layers, poetRounds]
  );

  const hash = useMemo(() => new Set(items.map(getHash)), [items]);
  const prevHashes = usePrevious(hash);

  useEffect(() => {
    if (dataSetRef.current && prevHashes) {
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
