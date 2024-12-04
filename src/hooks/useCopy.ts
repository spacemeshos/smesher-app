import { useCallback, useEffect, useRef, useState } from 'react';

import { useCopyToClipboard } from '@uidotdev/usehooks';

const useCopy = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCopy = useCallback(
    (data: string) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      copy(data);
      setIsCopied(true);
      timeout.current = setTimeout(() => {
        setIsCopied(false);
      }, 5000);
    },
    [timeout, copy]
  );

  useEffect(
    () => () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    },
    [timeout]
  );

  return {
    isCopied,
    onCopy,
  };
};

export default useCopy;
