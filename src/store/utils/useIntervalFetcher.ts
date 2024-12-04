import { useEffect } from 'react';
import { FETCH_NODE_STATUS_RETRY } from '../../utils/constants';
import { DynamicStore } from './createDynamicStore';
import { noop } from '../../utils/func';

const useIntervalFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: () => Promise<T>,
  seconds: number,
  dontDropData = false
) => {
  const { data, lastUpdate, setData, setError } = store;
  useEffect(() => {
    if (seconds <= 0) return noop;

    const layerDuration = seconds * 1000;
    const update = () => {
      if (
        !lastUpdate ||
        Date.now() - lastUpdate > layerDuration
      ) {
        fetcher().then(setData).catch(setError);
      }
    };

    update();
    const ival = setInterval(
      update,
      data ? layerDuration : FETCH_NODE_STATUS_RETRY
    );
    return () => clearInterval(ival);
  }, [lastUpdate, seconds, setError, setData, data]);

  return store;
};

export default useIntervalFetcher;
