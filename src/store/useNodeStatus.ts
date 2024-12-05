import { singletonHook } from 'react-singleton-hook';

import { fetchNodeStatus } from '../api/requests/netinfo';
import { NodeStatus } from '../types/networks';

import createDynamicStore, { createViewOnlyDynamicStore, getDynamicStoreDefaults } from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';


const useNodeStatusStore = createDynamicStore<NodeStatus>();

const useNodeStatus = () => {
  const store = useNodeStatusStore();
  useEveryLayerFetcher(store, fetchNodeStatus);
  return createViewOnlyDynamicStore(store);
};

export default singletonHook(getDynamicStoreDefaults(), useNodeStatus);
