import { useEffect, useState } from 'react';

import { FETCH_RETRY } from '../../utils/constants';
import { noop } from '../../utils/func';

import { DynamicStore } from './createDynamicStore';

const useIntervalFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: () => Promise<T>,
  seconds: number
) => {
  const [noApiError, setNoApiError] = useState(false);
  const { data, lastUpdate, setData, setError } = store;

  useEffect(() => {
    if (seconds <= 0) {
      setNoApiError(true);
      return noop;
    }

    setNoApiError(false);
    const layerDuration = seconds * 1000;
    const update = () => {
      if (!lastUpdate || Date.now() - lastUpdate > layerDuration) {
        fetcher().then(setData).catch(setError);
      }
    };

    update();
    const ival = setInterval(update, data ? layerDuration : FETCH_RETRY);
    return () => clearInterval(ival);
  }, [lastUpdate, seconds, setError, setData, data, fetcher, noApiError]);

  useEffect(() => {
    if (noApiError) {
      setError(new Error('Cannot connect to the API'), true);
    }
  }, [noApiError, setError]);

  return store;
};

export default useIntervalFetcher;
