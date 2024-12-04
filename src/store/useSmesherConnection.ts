import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { O } from '@mobily/ts-belt';

type State = {
  jsonRPC: null | string;
};

type Actions = {
  setConnection: (jsonRPC: string) => void;
};

type Selectors = {
  hasConnection: () => boolean;
  getConnection: () => O.Option<string>;
};

const STORE_KEY = 'smesher-connections';

const useSmesherConnection = create(
  persist<State & Actions & Selectors>(
    (set, get) => ({
      jsonRPC: null,
      // Actions
      setConnection: (jsonRPC: string) => {
        set({ jsonRPC });
      },
      // Selectors
      getConnection: () => {
        const state = get();
        return O.fromNullable(state.jsonRPC);
      },
      hasConnection: () => O.isSome(get().getConnection()),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSmesherConnection;
