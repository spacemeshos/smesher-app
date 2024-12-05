import { singletonHook } from 'react-singleton-hook';

import createDynamicStore, { createViewOnlyDynamicStore, getDynamicStoreDefaults } from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';
import { ProposalsByIdentity } from '../api/schemas/proposals';
import { fetchProposals } from '../api/requests/proposals';

const useProposalsStore = createDynamicStore<ProposalsByIdentity>();

const useProposals = () => {
  const store = useProposalsStore();
  useEveryLayerFetcher(store, fetchProposals);
  return createViewOnlyDynamicStore(store);
};

export default singletonHook(getDynamicStoreDefaults(), useProposals);
