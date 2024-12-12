import { useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchPoETInfo } from '../api/requests/poets';
import { PoETState } from '../types/poet';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useIntervalFetcher from './utils/useIntervalFetcher';
import useSmesherConnection from './useSmesherConnection';

const usePoetInfoStore = createDynamicStore<PoETState>();

const usePoETInfo = () => {
  const { getConnection } = useSmesherConnection();
  const store = usePoetInfoStore();
  const rpc = getConnection();
  const doFetch = rpc
    ? () => fetchPoETInfo(rpc)
    : () => Promise.reject(new Error('Cannot connect to the API'));

  useIntervalFetcher(store, doFetch, 60 * 60); // every hour
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), usePoETInfo);
