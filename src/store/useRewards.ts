import { useCallback, useMemo } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchRewardsBySmesherId } from '../api/requests/rewards';
import { HexString } from '../types/common';
import { Reward } from '../types/reward';

import createDynamicStore, {
  createViewOnlyDynamicStore,
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useEveryLayerFetcher from './utils/useEveryLayerFetcher';
import useSmesherStates from './useSmesherStates';

type RewardsState = Record<HexString, Reward[]>;
const useRewardsStore = createDynamicStore<RewardsState>();

const useRewards = () => {
  const store = useRewardsStore();
  const { data } = useSmesherStates();
  const identities = Object.keys(data || {});

  const fetchRewards = useCallback(
    async (rpc: string) => {
      if (!identities) return Promise.resolve<RewardsState>({});
      try {
        const rewards = await Promise.all(
          identities.map((id) => fetchRewardsBySmesherId(rpc, id))
        );
        const result: Record<HexString, Reward[]> = Object.fromEntries(
          rewards.map((r, i) => [identities[i], r])
        );
        store.setData(result);
        return result;
      } catch (err) {
        if (err instanceof Error) {
          store.setError(err);
        }
        return {};
      }
    },
    [identities, store]
  );
  useEveryLayerFetcher(store, fetchRewards);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useRewards);
