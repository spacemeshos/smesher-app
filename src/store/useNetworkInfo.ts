import { useCallback, useEffect, useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchNetworkInfo } from '../api/requests/netinfo';
import { Network } from '../types/networks';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useSmesherConnection from './useSmesherConnection';

const useNetworkInfoStore = createDynamicStore<Network>();

const useNetworkInfo = () => {
  const { getConnection } = useSmesherConnection();
  const store = useNetworkInfoStore();
  const rpc = getConnection();

  // Update function
  const update = useCallback(async () => {
    if (!rpc) {
      throw new Error(
        'Cannot fetch network info without a connection to Smesher service'
      );
    }
    try {
      const netInfo = await fetchNetworkInfo(rpc);
      store.setData(netInfo);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Cannot fetch network info', err);
      if (err instanceof Error) {
        store.setError(err);
      } else {
        store.setError(
          new Error(
            `Cannot fetch network info because of unknown error: ${err}`
          )
        );
      }
    }
  }, [rpc, store]);

  // Update automatically when the connection changes or on mount
  useEffect(() => {
    if (rpc && !store.data && !store.error) {
      update();
    }
  }, [rpc, store.data, store.error, update]);

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
