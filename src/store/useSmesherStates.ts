import { useEffect, useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import {
  fetchSmesherStatesWithCallback,
  mergeSmesherStates,
} from '../api/requests/smesherState';
import { SmesherIdentities } from '../api/schemas/smesherStates';
import { SECOND } from '../utils/constants';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useNetworkInfo from './useNetworkInfo';
import useSmesherConnection from './useSmesherConnection';

const useSmesherStateStore = createDynamicStore<SmesherIdentities>();

const useSmesherStates = () => {
  const store = useSmesherStateStore();
  const { data: netInfo } = useNetworkInfo();
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();

  const { setData } = store;

  const fetcher = useMemo(
    () =>
      fetchSmesherStatesWithCallback((newStates) =>
        setData((prev) => {
          const res = prev ? mergeSmesherStates(prev, newStates) : newStates;
          return res;
        })
      ),
    [setData]
  );

  useEffect(() => {
    // let ival: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (fetcher && rpc && netInfo?.layerDuration) {
      // ival = setInterval(() => fetcher(rpc), 30 * SECOND);
      timeout = setTimeout(() => fetcher(rpc), 5 * SECOND);
    }
    return () => {
      // if (ival) clearInterval(ival);
      if (timeout) clearTimeout(timeout);
    };
  }, [fetcher, netInfo, rpc]);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export const useSmesherIds = () => {
  const { data } = useSmesherStates();
  return useMemo(() => data && Object.keys(data), [data]);
};

export default singletonHook(getDynamicStoreDefaults(), useSmesherStates);
