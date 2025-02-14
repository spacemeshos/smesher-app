import fetchJSON from '../../utils/fetchJSON';
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

export type SmesherStatesSetter = (states: SmesherStates) => void;
export const fetchSmesherStatesWithCallback = (setter: SmesherStatesSetter) => {
  let isInProcess = false;
  // Datetime range of oldest and newest fetched states
  // Used to fetch all events within the specified range
  let fetched: [Date, Date] = [new Date(), new Date()];

  return async (
    rpc: string,
    order = SortOrder.ASC,
    to = new Date(),
    from: Date | undefined = undefined
  ) => {
    if (isInProcess) return;

    const fetchNext = async (chunkTo: Date, chunkFrom?: Date) => {
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

      setter(res);
      if (len === PER_PAGE) {
        if (order === SortOrder.ASC) {
          await fetchNext(to, fetched[1]);
        } else {
          await fetchNext(fetched[0], from);
        }
      } else {
        isInProcess = false;
      }
    };

    isInProcess = true;
    await fetchNext(to, from);
  };
};
