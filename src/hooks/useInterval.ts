import { useMemo, useRef } from 'react';

const useInterval = () => {
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  return useMemo(() => {
    const stop = () => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    };

    const set = (callback: () => void, ms: number) => {
      stop();
      ref.current = setInterval(callback, ms);
    };

    return { set, stop };
  }, [ref]);
};

export default useInterval;
