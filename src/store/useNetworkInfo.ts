import { useCallback, useEffect, useMemo, useRef } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchNetworkInfo } from '../api/requests/netinfo';
import { Network } from '../types/networks';
import { FETCH_RETRY } from '../utils/constants';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useSmesherConnection from './useSmesherConnection';

const useNetworkInfoStore = createDynamicStore<Network>();

const useNetworkInfo = () => {
  const { jsonRPC: rpc } = useSmesherConnection();
  const store = useNetworkInfoStore();

  const { setData, setError, error, lastUpdate } = store;
  // Update function
  const update = useCallback(async () => {
    if (!rpc) {
      throw new Error(
        'Cannot fetch network info without a connection to Smesher service'
      );
    }
    try {
      const netInfo = await fetchNetworkInfo(rpc);
      setData(netInfo);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Cannot fetch network info', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(
          new Error(
            `Cannot fetch network info because of unknown error: ${err}`
          )
        );
      }
    }
  }, [rpc, setError, setData]);

  // Update automatically when the connection changes or on mount
  useEffect(() => {
    if (rpc) {
      update();
    }
  }, [rpc, update]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Update on error
  useEffect(() => {
    const now = Date.now();
    if (rpc && error) {
      if (lastUpdate + FETCH_RETRY < now) {
        update();
      } else {
        timeoutRef.current = setTimeout(() => {
          update();
        }, lastUpdate + FETCH_RETRY - now);
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [error, lastUpdate, rpc, update]);

  // Provides only NetInfo and update function call
  return useMemo(
    () => ({
      ...createViewOnlyDynamicStore(store),
      update,
    }),
    [store, update]
  );
};

export default singletonHook(
  {
    ...getDynamicStoreDefaults(),
    update: () => {
      throw new Error('The hook is not initialized yet');
    },
  },
  useNetworkInfo
);
