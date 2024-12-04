import { create } from 'zustand';

export type DynamicStore<T> = {
  data: T | null;
  error: Error | null;
  lastUpdate: number;
  setData: (data: T) => void;
  setError: (error: Error) => void;
};

const createDynamicStore = <T>() => create<DynamicStore<T>>((set) => ({
  data: null,
  error: null,
  lastUpdate: 0,
  setData: (data: T) =>
    set({ data, error: null, lastUpdate: Date.now() }),
  setError: (error: Error, dontDropData = false) =>
    set({ error, lastUpdate: Date.now() }),
}));

export default createDynamicStore;
