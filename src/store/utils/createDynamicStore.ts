import { create } from 'zustand';

type SetterFn<T> = (prev: T | null) => T;

export type DynamicStore<T> = {
  data: T | null;
  error: Error | null;
  lastUpdate: number;
  setData: (arg: T | SetterFn<T>) => void;
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
    setData: (arg: T | SetterFn<T>) => {
      if (typeof arg === 'function') {
        set((state) => ({
          data: (arg as SetterFn<T>)(state.data),
          error: null,
          lastUpdate: Date.now(),
        }));
      } else {
        set({ data: arg as T, error: null, lastUpdate: Date.now() });
      }
    },
    setError: (error: Error, noLastUpdate = false) =>
      set({
        error,
        data: null,
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
