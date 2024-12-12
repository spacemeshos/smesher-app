import { useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchSmesherStates } from '../api/requests/smesherState';
import { SmesherIdentities } from '../api/schemas/smesherStates';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';

const useSmesherStateStore = createDynamicStore<SmesherIdentities>();

const useSmesherStates = () => {
  const store = useSmesherStateStore();
  useEveryLayerFetcher(store, fetchSmesherStates);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useSmesherStates);
