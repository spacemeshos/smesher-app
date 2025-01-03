import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { O } from '@mobily/ts-belt';

type State = {
  jsonRPC: null | string;
  lastRPC: null | string;
};

type Actions = {
  setConnection: (jsonRPC: string) => void;
};

type Selectors = {
  hasConnection: () => boolean;
  getConnection: () => O.Option<string>;
  getLastConnection: () => O.Option<string>;
  refreshConnection: () => void;
};

const STORE_KEY = 'smesher-connections';

const useSmesherConnection = create(
  persist<State & Actions & Selectors>(
    (set, get) => ({
      jsonRPC: null,
      lastRPC: null,
      // Actions
      setConnection: (jsonRPC: string) => {
        if (jsonRPC === '') {
          set({ jsonRPC: null });
          return;
        }
        set({ jsonRPC, lastRPC: jsonRPC });
      },
      // Selectors
      getConnection: () => {
        const state = get();
        return O.fromNullable(state.jsonRPC);
      },
      getLastConnection: () => {
        const state = get();
        return O.fromNullable(state.lastRPC);
      },
      hasConnection: () => O.isSome(get().getConnection()),
      refreshConnection: () => {
        const { getConnection, setConnection } = get();
        const connection = getConnection();
        if (!connection) return;
        setConnection('');
        setTimeout(() => {
          setConnection(connection);
        }, 1);
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSmesherConnection;
