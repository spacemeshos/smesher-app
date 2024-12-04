import { singletonHook } from 'react-singleton-hook';

import createDynamicStore from './utils/createDynamicStore';
import useSmesherConnection from './useSmesherConnection';
import { fetchSmesherStates } from '../api/requests/smesherState';
import { SmesherIdentities } from '../api/schemas/smesherStates';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';

const useSmesherStateStore = createDynamicStore<SmesherIdentities>();

const useSmesherStates = () => {
  const { getConnection } = useSmesherConnection();
  const store = useSmesherStateStore();
  const rpc = getConnection();
  if (!rpc) return { ids: store.data, error: store.error};
  useEveryLayerFetcher(store, () => fetchSmesherStates(rpc));
  return { ids: store.data, error: store.error };
};

export default singletonHook({ ids: null, error: null }, useSmesherStates);
