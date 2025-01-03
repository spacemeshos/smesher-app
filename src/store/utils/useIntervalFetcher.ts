import { useCallback, useEffect, useRef, useState } from 'react';

import { FETCH_RETRY } from '../../utils/constants';

import { DynamicStore } from './createDynamicStore';

const useIntervalFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: () => Promise<T>,
  seconds: number
) => {
  const [noApiError, setNoApiError] = useState(false);
  const { setData, setError } = store;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dropTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const dropInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const update = useCallback((): Promise<void> => {
    dropTimeout();
    return fetcher()
      .then(setData)
      .catch(async (err) => {
        setError(err);
        return new Promise((resolve) => {
          timeoutRef.current = setTimeout(() => {
            dropTimeout();
            resolve(update());
          }, FETCH_RETRY);
        });
      });
  }, [fetcher, setData, setError]);

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
      return dropInterval;
    }
    intervalRef.current = setInterval(update, seconds * 1000);
    return dropInterval;
  }, [seconds, update]);

  // Display API error
  useEffect(() => {
    if (noApiError) {
      setError(new Error('Cannot connect to the API'), true);
    }
  }, [noApiError, setError]);

  return store;
};

export default useIntervalFetcher;
