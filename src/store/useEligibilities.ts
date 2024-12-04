import { singletonHook } from 'react-singleton-hook';

import createDynamicStore from './utils/createDynamicStore';
import useSmesherConnection from './useSmesherConnection';
// import useEveryLayerFetcher from './utils/useEveryLayerFetcher';
import { ElibigilitiesByIdentity } from '../api/schemas/eligibilities';
import { fetchEligibilities } from '../api/requests/eligibilities';
import useEveryEpochFetcher from './utils/useEveryEpochFetcher';

const useEligibilitiesStore = createDynamicStore<ElibigilitiesByIdentity>();

const useEligibilities = () => {
  const { getConnection } = useSmesherConnection();
  const store = useEligibilitiesStore();
  const rpc = getConnection();
  if (!rpc) return { ids: store.data, error: store.error};
  useEveryEpochFetcher(store, () => fetchEligibilities(rpc));
  return { ids: store.data, error: store.error };
};

export default singletonHook({ ids: null, error: null }, useEligibilities);
