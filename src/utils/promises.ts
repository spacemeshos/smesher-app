export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const postpone = <T>(fn: () => Promise<T> | T, ms = 1): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const r = fn();
      if (r instanceof Promise) {
        r.then(resolve).catch(reject);
        return;
      }
      resolve(r);
    }, ms);
  });
