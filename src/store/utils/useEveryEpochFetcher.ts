import { DynamicStore } from './createDynamicStore';
import useNetworkInfo from '../useNetworkInfo';
import useSmesherConnection from '../useSmesherConnection';
import useNodeStatus from '../useNodeStatus';
import { useEffect, useRef } from 'react';
import { SECOND } from '../../utils/constants';

const useEveryEpochFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: () => Promise<T>,
  dontDropData = false
) => {
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();
  const { info } = useNetworkInfo();
  const { status } = useNodeStatus();
  const { lastUpdate, setData, setError } = store;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rpc || !info || !status) return;

    const EXTRA_DELAY = (info.layerDuration / 2) * SECOND;

    const currentLayer = status.currentLayer;
    const currentEpoch = Math.floor(currentLayer / info.layersPerEpoch);
    const nextEpoch = currentEpoch + 1;
    const nextEpochStartsAtLayer = nextEpoch * info.layersPerEpoch;

    const timeToNextEpochStartMs = (nextEpochStartsAtLayer - currentLayer) * info.layerDuration * SECOND;
    const epochIntervalMs = info.layersPerEpoch * info.layerDuration * SECOND;

    console.log('use effect :-)', timeToNextEpochStartMs);
    const update = () => {
      console.log('update: fetch!');
      fetcher().then(setData).catch(setError);
    };

    if (!lastUpdate) {
      // Update only once on a start up
      update();
    }

    if (!timer.current) {
      console.log('timer!!!');
      timer.current = setTimeout(() => {
        console.log('timeout!');
        update();
        setInterval(() => {
          console.log('interval!');
          update();
        }, epochIntervalMs);
      }, timeToNextEpochStartMs + EXTRA_DELAY);
    }
  }, [fetcher, lastUpdate, setData, setError, info?.layersPerEpoch, info?.layerDuration, timer]);

  return store;
};

export default useEveryEpochFetcher;
