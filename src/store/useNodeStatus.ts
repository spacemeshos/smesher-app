import { singletonHook } from 'react-singleton-hook';

import { fetchNodeStatus } from '../api/requests/netinfo';
import { NodeStatus } from '../types/networks';

import createDynamicStore from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';


const useNodeStatusStore = createDynamicStore<NodeStatus>();

const useNodeStatus = () => {
  const store = useNodeStatusStore();
  useEveryLayerFetcher(store, fetchNodeStatus);
  return { status: store.data, error: store.error };
};

export default singletonHook({ status: null, error: null }, useNodeStatus);
