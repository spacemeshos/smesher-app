import useNetworkInfo from '../useNetworkInfo';
import useSmesherConnection from '../useSmesherConnection';

import { DynamicStore } from './createDynamicStore';
import useIntervalFetcher from './useIntervalFetcher';

const useEveryLayerFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: (rpc: string) => Promise<T>
) => {
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();
  const { data } = useNetworkInfo();
  const doFetch = rpc
    ? () => fetcher(rpc)
    : () => Promise.reject(new Error('Cannot connect to the API'));

  // TODO: Wait for the layer beginning and only only then set interval
  useIntervalFetcher(store, doFetch, data?.layerDuration || 0);
  return store;
};

export default useEveryLayerFetcher;
