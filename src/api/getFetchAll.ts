type FetchChunkFn<Arg, Res> = (
  rpc: string,
  arg: Arg,
  limit: number,
  offset: number
) => Promise<Res[]>;
type FetchAllFn<Arg, Res> = (rpc: string, arg: Arg) => Promise<Res[]>;

const getFetchAll = <Arg, Res>(
  fn: FetchChunkFn<Arg, Res>,
  perPage = 100,
  maxCycles = Infinity
): FetchAllFn<Arg, Res> => {
  let cycle = 1;
  const prevOffset: Record<string, number> = {};
  const fetchNextChunk = async (rpc: string, arg: Arg): Promise<Res[]> => {
    const key = JSON.stringify(arg);
    const curOffset = prevOffset[key] ?? 0;
    const res = await fn(rpc, arg, perPage, curOffset);
    prevOffset[key] = curOffset + res.length;
    if (res.length === 100 && cycle < maxCycles) {
      cycle += 1;
      return [...res, ...(await fetchNextChunk(rpc, arg))];
    }
    return res;
  };

  return (rpc: string, arg: Arg) => fetchNextChunk(rpc, arg);
};

export default getFetchAll;
