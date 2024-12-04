import { singletonHook } from 'react-singleton-hook';
import { fetchPoETInfo } from '../api/requests/poets';
import { PoETState } from '../types/poet';
import createDynamicStore from './utils/createDynamicStore';
import useSmesherConnection from './useSmesherConnection';
import useIntervalFetcher from './utils/useIntervalFetcher';

const usePoetInfoStore = createDynamicStore<PoETState>();

const usePoETInfo = () => {
  const { getConnection } = useSmesherConnection();
  const store = usePoetInfoStore();
  const rpc = getConnection();
  if (!rpc) return { info: store.data, error: store.error};
  useIntervalFetcher(store, () => fetchPoETInfo(rpc), 60 * 60); // every hour
  return { info: store.data, error: store.error };
};

export default singletonHook({ info: null, error: null }, usePoETInfo);
