import { useEffect, useMemo, useRef, useState } from 'react';
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
  const idsRef = useRef(new Set<HexString>());
  const ids = useSmesherIds();
  const [identities, setIdentities] = useState(<HexString[]>[]);

  useEffect(() => {
    // Update idsRef list
    if (!ids) return;
    let changed = false;
    ids.forEach((id) => {
      if (!idsRef.current.has(id)) {
        idsRef.current.add(id);
        changed = true;
      }
    });
    if (changed) {
      setIdentities(Array.from(idsRef.current));
    }
  }, [ids]);

  const fetchRewards = useMemo(
    () => fetchRewardsBySmesherIds(Array.from(identities)),
    [identities]
  );
  useEveryLayerFetcher(store, fetchRewards);
  return useMemo(() => createViewOnlyDynamicStore(store), [store]);
};

export default singletonHook(getDynamicStoreDefaults(), useRewards);
