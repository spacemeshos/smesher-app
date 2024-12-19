import { create } from 'zustand';

export type DynamicStore<T> = {
  data: T | null;
  error: Error | null;
  lastUpdate: number;
  setData: (data: T) => void;
  setError: (error: Error, noLastUpdate?: boolean) => void;
};

export type ViewOnlyDynamicStore<T> = {
  data: T | null;
  error: Error | null;
  lastUpdate: number;
};

const createDynamicStore = <T>() =>
  create<DynamicStore<T>>((set) => ({
    data: null,
    error: null,
    lastUpdate: 0,
    setData: (data: T) => set({ data, error: null, lastUpdate: Date.now() }),
    setError: (error: Error, noLastUpdate = false) =>
      set({
        error,
        ...(noLastUpdate ? {} : { lastUpdate: Date.now() }),
      }),
  }));

export const createViewOnlyDynamicStore = <T>(
  dynStore: DynamicStore<T>
): ViewOnlyDynamicStore<T> => ({
  data: dynStore.data,
  error: dynStore.error,
  lastUpdate: dynStore.lastUpdate,
});

export const getDynamicStoreDefaults = () => ({
  data: null,
  error: null,
  lastUpdate: 0,
});

export default createDynamicStore;
