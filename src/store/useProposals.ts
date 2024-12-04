import { singletonHook } from 'react-singleton-hook';

import createDynamicStore from './utils/createDynamicStore';
import useSmesherConnection from './useSmesherConnection';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';
import { ProposalsByIdentity } from '../api/schemas/proposals';
import { fetchProposals } from '../api/requests/proposals';

const useProposalsStore = createDynamicStore<ProposalsByIdentity>();

const useProposals = () => {
  const { getConnection } = useSmesherConnection();
  const store = useProposalsStore();
  const rpc = getConnection();
  if (!rpc) return { ids: store.data, error: store.error};
  useEveryLayerFetcher(store, () => fetchProposals(rpc));
  return { ids: store.data, error: store.error };
};

export default singletonHook({ ids: null, error: null }, useProposals);
