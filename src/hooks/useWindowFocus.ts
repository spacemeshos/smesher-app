import { useEffect, useState } from 'react';

function useWindowFocus(timeout = 0) {
  const [focused, setFocused] = useState(true);
  const [blurTime, setBlurTime] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        setBlurTime(now);
      } else {
        setBlurTime(0);
        setFocused(true);
      }
    };

    const handleFocus = () => {
      setBlurTime(0);
      setFocused(true);
    };

    const handleBlur = () => {
      const now = Date.now();
      setBlurTime(now);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const interval = setInterval(() => {
      if (blurTime !== 0 && Date.now() - blurTime > timeout) {
        setFocused(false);
      }
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(interval);
    };
  }, [timeout, blurTime]);

  return focused;
}

export default useWindowFocus;
