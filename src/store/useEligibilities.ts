import { singletonHook } from 'react-singleton-hook';

import createDynamicStore, { createViewOnlyDynamicStore, getDynamicStoreDefaults } from './utils/createDynamicStore';
import { ElibigilitiesByIdentity } from '../api/schemas/eligibilities';
import { fetchEligibilities } from '../api/requests/eligibilities';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';

const useEligibilitiesStore = createDynamicStore<ElibigilitiesByIdentity>();

const useEligibilities = () => {
  const store = useEligibilitiesStore();
  useEveryLayerFetcher(store, fetchEligibilities);
  return createViewOnlyDynamicStore(store);
};

export default singletonHook(getDynamicStoreDefaults(), useEligibilities);
