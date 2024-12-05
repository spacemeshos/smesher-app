import { DynamicStore } from './createDynamicStore';
import useNetworkInfo from '../useNetworkInfo';
import useSmesherConnection from '../useSmesherConnection';
import useIntervalFetcher from './useIntervalFetcher';

const useEveryLayerFetcher = <T>(
  store: DynamicStore<T>,
  fetcher: (rpc: string) => Promise<T>,
  dontDropData = false
) => {
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();
  const { data } = useNetworkInfo();
  if (!rpc) return store;

  // TODO: Wait for the layer beginning and only only then set interval
  useIntervalFetcher(store, () => fetcher(rpc), data?.layerDuration || 0, dontDropData);

  return store;
};

export default useEveryLayerFetcher;
