import { useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchProposals } from '../api/requests/proposals';
import { ProposalsByIdentity } from '../api/schemas/proposals';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';

const useProposalsStore = createDynamicStore<ProposalsByIdentity>();

const useProposals = () => {
  const store = useProposalsStore();
  useEveryLayerFetcher(store, fetchProposals);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useProposals);
