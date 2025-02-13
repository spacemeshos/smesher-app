import { useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchRewardsBySmesherIds } from '../api/requests/rewards';
import { HexString } from '../types/common';
import { Reward } from '../types/reward';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';
import { useSmesherIds } from './useSmesherStates';

type RewardsState = Record<HexString, Reward[]>;
const useRewardsStore = createDynamicStore<RewardsState>();

const useRewards = () => {
  const store = useRewardsStore();
  const ids = useSmesherIds();

  const fetchRewards = useMemo(
    () => fetchRewardsBySmesherIds(ids ?? []),
    [ids]
  );
  useEveryLayerFetcher(store, fetchRewards);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useRewards);
