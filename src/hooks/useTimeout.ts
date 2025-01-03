import { useMemo, useRef } from 'react';

const useTimeout = () => {
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useMemo(() => {
    const stop = () => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    };
    const set = (callback: () => void, ms: number) => {
      stop();
      ref.current = setTimeout(callback, ms);
    };
    return { set, stop };
  }, [ref]);
};

export default useTimeout;
