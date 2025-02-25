import { useCallback, useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchRewardsBySmesherIds } from '../api/requests/rewards';
import { RewardsPerIdentity } from '../types/reward';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
  SetterFn,
} from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';
import { useSmesherIds } from './useSmesherStates';

const useRewardsStore = createDynamicStore<RewardsPerIdentity>();

type RecordList<T> = Record<string, T[]>;
const merge = <T>(prev: RecordList<T>, next: RecordList<T>) =>
  Object.entries(next).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: [...(prev[key] || []), ...value],
    }),
    prev
  );

const useRewards = () => {
  const store = useRewardsStore();
  const ids = useSmesherIds();

  const fetchRewards = useMemo(
    () => fetchRewardsBySmesherIds(ids ?? []),
    [ids]
  );

  const { setData } = store;

  const setDataToRecord = useCallback(
    (input: RewardsPerIdentity | SetterFn<RewardsPerIdentity>) => {
      if (typeof input === 'function') {
        // Kinda imposible state
        throw new Error(
          'Rewards store is not supposed to have a setter function'
        );
      } else {
        setData((prev) => (prev ? merge(prev, input) : input));
      }
    },
    [setData]
  );
  const storeSetRecord = useMemo(
    () => ({
      ...store,
      setData: setDataToRecord,
    }),
    [setDataToRecord, store]
  );

  useEveryLayerFetcher(storeSetRecord, fetchRewards);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useRewards);
