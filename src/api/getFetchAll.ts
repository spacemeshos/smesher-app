type FetchChunkFn<Arg, Res extends T[] | Record<string, T>, T> = (
  rpc: string,
  arg: Arg,
  limit: number,
  offset: number
) => Promise<Res>;
type FetchAllFn<Arg, Res> = (rpc: string, arg: Arg) => Promise<Res[]>;

const getFetchAll = <Arg, Res extends T[] | Record<string, T>, T>(
  fn: FetchChunkFn<Arg, Res, T>,
  perPage = 100,
  maxCycles = 10
): FetchAllFn<Arg, Res> => {
  let cycle = 1;
  const fetchNextChunk = async (
    rpc: string,
    arg: Arg,
    page: number
  ): Promise<Res> => {
    const res = await fn(rpc, arg, perPage, page * perPage);

    // Fetch and merge arrays
    if (Array.isArray(res) && res.length === 100 && cycle < maxCycles) {
      cycle += 1;
      const merged: T[] = [
        ...res,
        ...((await fetchNextChunk(rpc, arg, page + 1)) as T[]),
      ];
      return merged as Res;
    }

    // Fetch and merge records
    if (Object.keys(res).length === 100 && cycle < maxCycles) {
      cycle += 1;
      const merged = {
        ...(res as Record<string, T>),
        ...((await fetchNextChunk(rpc, arg, page + 1)) as Record<string, T>),
      };
      return merged as Res;
    }
    return res;
  };

  return (rpc: string, arg: Arg) => fetchNextChunk(rpc, arg, 0);
};

export default getFetchAll;
