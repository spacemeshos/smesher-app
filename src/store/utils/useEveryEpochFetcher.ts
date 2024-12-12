import { useEffect, useRef } from 'react';

import { SECOND } from '../../utils/constants';
import useNetworkInfo from '../useNetworkInfo';
import useNodeStatus from '../useNodeStatus';
import useSmesherConnection from '../useSmesherConnection';

import { DynamicStore } from './createDynamicStore';

const useEveryEpochFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: () => Promise<T>
) => {
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();
  const { data: info } = useNetworkInfo();
  const { data: status } = useNodeStatus();
  const { lastUpdate, setData, setError } = store;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rpc || !info || !status) return;

    const EXTRA_DELAY = (info.layerDuration / 2) * SECOND;

    const { currentLayer } = status;
    const currentEpoch = Math.floor(currentLayer / info.layersPerEpoch);
    const nextEpoch = currentEpoch + 1;
    const nextEpochStartsAtLayer = nextEpoch * info.layersPerEpoch;

    const timeToNextEpochStartMs =
      (nextEpochStartsAtLayer - currentLayer) * info.layerDuration * SECOND;
    const epochIntervalMs = info.layersPerEpoch * info.layerDuration * SECOND;

    const update = () => {
      fetcher().then(setData).catch(setError);
    };

    if (!lastUpdate) {
      // Update only once on a start up
      update();
    }

    if (!timer.current) {
      timer.current = setTimeout(() => {
        update();
        setInterval(() => {
          update();
        }, epochIntervalMs);
      }, timeToNextEpochStartMs + EXTRA_DELAY);
    }
  }, [
    fetcher,
    lastUpdate,
    setData,
    setError,
    info?.layersPerEpoch,
    info?.layerDuration,
    timer,
    rpc,
    info,
    status,
  ]);

  return store;
};

export default useEveryEpochFetcher;
