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
  maxCycles = 10
): FetchAllFn<Arg, Res> => {
  let cycle = 1;
  const fetchNextChunk = async (
    rpc: string,
    arg: Arg,
    page: number
  ): Promise<Res[]> => {
    const res = await fn(rpc, arg, perPage, page * perPage);
    if (res.length === 100 && cycle < maxCycles) {
      cycle += 1;
      return [...res, ...(await fetchNextChunk(rpc, arg, page + 1))];
    }
    return res;
  };

  return (rpc: string, arg: Arg) => fetchNextChunk(rpc, arg, 0);
};

export default getFetchAll;
