import { Network } from '../types/networks';
import useSmesherConnection from './useSmesherConnection';
import { fetchNetworkInfo } from '../api/requests/netinfo';
import { singletonHook } from 'react-singleton-hook';
import { useEffect } from 'react';
import createDynamicStore from './utils/createDynamicStore';

const useNetworkInfoStore = createDynamicStore<Network>();

const useNetworkInfo = () => {
  const { getConnection } = useSmesherConnection();
  const { data, error, setData, setError } = useNetworkInfoStore();
  const rpc = getConnection();

  // Update function
  const update = async () => {
    const rpc = getConnection();
    if (!rpc) {
      throw new Error('Cannot fetch network info without a connection to Smesher service');
    }
    try {
      const netInfo = await fetchNetworkInfo(rpc);
      setData(netInfo);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Cannot fetch network info', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(`Cannot fetch network info because of unknown error: ${err}`));
      }
    }
  };

  // Update automatically when the connection changes or on mount
  useEffect(() => {
    if (rpc && !data) {
      update();
    }
  }, [rpc]);

  // Provides only NetInfo and update function call
  return {
    info: data,
    error,
    update,
  };
};

export default singletonHook({
  info: null,
  error: null,
  update: () => { throw new Error('The hook is not initialized yet'); },
}, useNetworkInfo);
