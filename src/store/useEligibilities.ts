import { useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchEligibilities } from '../api/requests/eligibilities';
import { ElibigilitiesByIdentity } from '../api/schemas/eligibilities';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';

const useEligibilitiesStore = createDynamicStore<ElibigilitiesByIdentity>();

const useEligibilities = () => {
  const store = useEligibilitiesStore();
  useEveryLayerFetcher(store, fetchEligibilities);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useEligibilities);
