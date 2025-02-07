import { useEffect, useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchActivationsCount } from '../api/requests/activations';
import { MINUTE } from '../utils/constants';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useNodeStatus from './useNodeStatus';
import useSmesherConnection from './useSmesherConnection';

const useActivationsStore = createDynamicStore<{
  count: number;
}>();

const useActivations = () => {
  const store = useActivationsStore();
  const Node = useNodeStatus();
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();
  const { setData } = store;
  const { isSynced } = Node.data || {};
  useEffect(() => {
    let ival: ReturnType<typeof setInterval> | null = null;

    if (rpc) {
      const fetcher = () =>
        fetchActivationsCount(rpc).then((res) => {
          setData({ count: res });
        });

      fetcher();
      if (!isSynced) {
        if (ival) {
          clearInterval(ival);
        }
        ival = setInterval(fetcher, MINUTE);
      }
    }
    return () => {
      if (ival) {
        clearInterval(ival);
      }
    };
  }, [isSynced, rpc, setData]);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useActivations);
