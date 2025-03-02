import { useEffect, useMemo, useRef, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { fetchSmesherStatesWithCallback } from '../api/requests/smesherState';
import { IdentityStateInfo } from '../api/schemas/smesherStates';
import SortOrder from '../api/sortOrder';
import { fromBase64 } from '../utils/base64';
import { MINUTE, SECOND } from '../utils/constants';
import { toHexString } from '../utils/hexString';
import {
  getEpochByLayer,
  getEpochStartTime,
  getLayerByTime,
} from '../utils/timeline';

import createDynamicStore, {
  getDynamicStoreDefaults,
} from './utils/createDynamicStore';
import useNetworkInfo from './useNetworkInfo';
import useSmesherConnection from './useSmesherConnection';

// How many epochs to fetch from history
const EPOCHS_IN_HISTORY = 5;

const useSmesherStateStore = createDynamicStore<IdentityStateInfo[]>();

const useSmesherStatesCore = () => {
  const store = useSmesherStateStore();
  const { data: netInfo } = useNetworkInfo();
  const { getConnection } = useSmesherConnection();
  const rpc = getConnection();
  const [fetchedRange, setFetchedRange] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const [isHistoryLoaded, setHistoryLoaded] = useState(false);

  const { setData, setError, data } = store;

  const fetcher = useMemo(
    () =>
      fetchSmesherStatesWithCallback((next, err) => {
        if (!next) {
          const e =
            err ||
            new Error('Cannot fetch smesher states due to unknown error');
          setError(e, { dontDropData: true });
          return;
        }
        setData((prev) => {
          const res = prev ? [...prev, ...next] : next;
          const first = res[0];
          const last = res[res.length - 1];
          if (first && last) {
            // Because it might be fetched in ASC and DESC order
            // We need to store dates in the correct order
            // [Oldest date, Recent date]
            const firstTime = new Date(first.time);
            const lastTime = new Date(last.time);
            setFetchedRange(
              firstTime < lastTime
                ? [firstTime, lastTime]
                : [lastTime, firstTime]
            );
          }
          return res;
        });
      }),
    [setData, setError]
  );

  useEffect(() => {
    // Fetch events from history
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (fetcher && rpc && netInfo) {
      const currentLayerByTime = getLayerByTime(
        netInfo.layerDuration,
        netInfo.genesisTime,
        Date.now()
      );
      const currentEpoch = getEpochByLayer(
        netInfo.layersPerEpoch,
        currentLayerByTime
      );
      const epochRangeLimit = Math.max(currentEpoch - EPOCHS_IN_HISTORY, 0);
      const epochRangeLimitTime =
        getEpochStartTime(
          netInfo.layerDuration,
          netInfo.layersPerEpoch,
          epochRangeLimit
        ) + netInfo.genesisTime;
      const fromDate = new Date(epochRangeLimitTime);
      timeout = setTimeout(async () => {
        await fetcher(rpc, SortOrder.ASC, new Date(), fromDate);
        setHistoryLoaded(true);
      }, SECOND);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [fetcher, netInfo, rpc]);

  useEffect(() => {
    // Fetch recent events
    let ival: ReturnType<typeof setInterval> | null = null;
    if (fetcher && rpc && netInfo) {
      ival = setInterval(() => {
        fetcher(rpc, SortOrder.ASC, new Date(), fetchedRange[1]);
      }, Math.max((netInfo.layerDuration * SECOND) / 3, MINUTE));
    }
    return () => {
      if (ival) clearInterval(ival);
    };
  }, [fetchedRange, fetcher, netInfo, rpc]);

  const statesByIdentity = useMemo(
    () =>
      data &&
      data.reduce((acc, item) => {
        const id = toHexString(fromBase64(item.smesher));
        const prevItems = acc[id];
        acc[id] = prevItems ? [...prevItems, item] : [item];
        return acc;
      }, {} as Record<string, IdentityStateInfo[]>),
    [data]
  );

  const outputState = useMemo(
    () =>
      statesByIdentity && {
        states: statesByIdentity,
        isHistoryLoaded,
      },
    [isHistoryLoaded, statesByIdentity]
  );

  return useMemo(
    () => ({
      data: outputState,
      error: store.error,
      lastUpdate: store.lastUpdate,
    }),
    [outputState, store]
  );
};

const useSmesherStates = singletonHook(
  getDynamicStoreDefaults(),
  useSmesherStatesCore
);

export const useSmesherIds = () => {
  const { data } = useSmesherStates();
  const idsRef = useRef(new Set<string>());
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!data?.states) return;

    let changed = false;
    Object.keys(data.states).forEach((id) => {
      if (!idsRef.current.has(id)) {
        idsRef.current.add(id);
        changed = true;
      }
    });
    if (changed) {
      setIds(Array.from(idsRef.current));
    }
  }, [data]);

  return ids;
};

export default useSmesherStates;
