import { SECOND } from '../../utils/constants';
import fetchJSON from '../../utils/fetchJSON';
import { delay } from '../../utils/promises';
import { parseResponse } from '../schemas/error';
import {
  IdentityStateInfo,
  SmesherStatesResponseSchema,
} from '../schemas/smesherStates';
import SortOrder from '../sortOrder';

const PER_PAGE = 100;

export const fetchSmesherStatesChunk = (
  rpc: string,
  limit = PER_PAGE,
  order = SortOrder.DESC,
  to = new Date(),
  from: Date | undefined = undefined
) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    order: order.toString(),
    to: to.toISOString(),
    ...(from ? { from: from.toISOString() } : {}),
  });
  return fetchJSON(
    `${rpc}/spacemesh.v2beta1.SmeshingIdentitiesService/States?${params}`,
    {
      method: 'GET',
    }
  )
    .then(parseResponse(SmesherStatesResponseSchema))
    .then((res) => res.states);
};

export type SmesherStates = IdentityStateInfo[];

export type SmesherStatesSetter = (
  states: SmesherStates | null,
  error: Error | null
) => void;
export const fetchSmesherStatesWithCallback = (setter: SmesherStatesSetter) => {
  let isInProcess: null | Promise<void> = null;
  // Datetime range of oldest and newest fetched states
  // Used to fetch all events within the specified range
  let fetched: [Date, Date] = [new Date(), new Date()];

  return async (
    rpc: string,
    order = SortOrder.ASC,
    to = new Date(),
    from: Date | undefined = undefined
  ) => {
    if (isInProcess) return isInProcess;

    const fetchNext = async (chunkTo: Date, chunkFrom?: Date) => {
      try {
        const res = await fetchSmesherStatesChunk(
          rpc,
          PER_PAGE,
          order,
          chunkTo,
          chunkFrom
        );
        const len = res.length;

        const first = res[0];
        const last = res[len - 1];
        if (!first?.time) {
          throw new Error(
            `Smesher event (first) supposed to have timestamp: ${JSON.stringify(
              first
            )}`
          );
        }
        if (!last?.time) {
          throw new Error(
            `Smesher event (last) supposed to have timestamp: ${JSON.stringify(
              last
            )}`
          );
        }
        fetched =
          order === SortOrder.ASC
            ? [new Date(first.time), new Date(last.time)]
            : [new Date(last.time), new Date(first.time)];

        setter(res, null);
        if (len === PER_PAGE) {
          const args: [Date, Date?] =
            order === SortOrder.ASC ? [to, fetched[1]] : [fetched[0], from];
          await fetchNext(...args);
        } else {
          isInProcess = null;
        }
      } catch (err) {
        if (err instanceof Error) {
          setter(null, err);
        }
        await delay(5 * SECOND);
        await fetchNext(chunkTo, chunkFrom);
      }
    };

    const result = fetchNext(to, from);
    isInProcess = result;
    await isInProcess;
    isInProcess = null;
    return result;
  };
};
