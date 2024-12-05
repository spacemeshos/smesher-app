import { singletonHook } from 'react-singleton-hook';

import createDynamicStore, { createViewOnlyDynamicStore, getDynamicStoreDefaults } from './utils/createDynamicStore';
import { fetchSmesherStates } from '../api/requests/smesherState';
import { SmesherIdentities } from '../api/schemas/smesherStates';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';

const useSmesherStateStore = createDynamicStore<SmesherIdentities>();

const useSmesherStates = () => {
  const store = useSmesherStateStore();
  useEveryLayerFetcher(store, fetchSmesherStates);
  return createViewOnlyDynamicStore(store);
};

export default singletonHook(getDynamicStoreDefaults(), useSmesherStates);
