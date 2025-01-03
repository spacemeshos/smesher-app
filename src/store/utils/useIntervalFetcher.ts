import { useCallback, useEffect, useState } from 'react';

import useInterval from '../../hooks/useInterval';
import useTimeout from '../../hooks/useTimeout';
import { FETCH_RETRY } from '../../utils/constants';

import { DynamicStore } from './createDynamicStore';

const useIntervalFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: () => Promise<T>,
  seconds: number
) => {
  const [noApiError, setNoApiError] = useState(false);
  const { setData, setError } = store;

  const retryRunner = useTimeout();
  const periodicRunner = useInterval();

  const update = useCallback((): Promise<void> => {
    retryRunner.stop();
    return fetcher()
      .then(setData)
      .catch(async (err) => {
        setError(err);
        return new Promise((resolve) => {
          retryRunner.set(() => {
            retryRunner.stop();
            resolve(update());
          }, FETCH_RETRY);
        });
      });
  }, [fetcher, retryRunner, setData, setError]);

  // Update once on mount
  useEffect(() => {
    if (seconds <= 0) {
      setNoApiError(true);
      return;
    }
    setNoApiError(false);
    update();
  }, [seconds, update]);

  // Update every N seconds
  useEffect(() => {
    if (seconds <= 0) {
      setNoApiError(true);
      return periodicRunner.stop;
    }
    periodicRunner.set(update, seconds * 1000);
    return periodicRunner.stop;
  }, [periodicRunner, seconds, update]);

  // Display API error
  useEffect(() => {
    if (noApiError) {
      setError(new Error('Cannot connect to the API'), true);
    }
  }, [noApiError, setError]);

  return store;
};

export default useIntervalFetcher;
