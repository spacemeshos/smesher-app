import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';
import {
  IdentityStateInfo,
  SmesherStatesResponseSchema,
} from '../schemas/smesherStates';

const PER_PAGE = 100;

export const fetchSmesherStatesChunk = (
  rpc: string,
  limit = PER_PAGE,
  offset = 0
) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  return fetchJSON(
    `${rpc}/spacemesh.v2beta1.SmeshingIdentitiesService/States?${params}`,
    {
      method: 'GET',
    }
  )
    .then(parseResponse(SmesherStatesResponseSchema))
    .then((res) => res.identities);
};

type SmesherStates = Record<string, { history: IdentityStateInfo[] }>;

const mergeSmesherStates = (
  obj1: SmesherStates,
  obj2: SmesherStates
): SmesherStates =>
  Object.keys(obj2).reduce(
    (acc, key) => {
      const history = [
        ...(acc[key]?.history ?? []),
        ...(obj2[key]?.history ?? []),
      ];
      return {
        ...acc,
        [key]: {
          ...acc[key],
          ...obj2[key],
          history,
        },
      };
    },
    { ...obj1 }
  );

export const fetchSmesherStates = async (rpc: string) => {
  const fetchNext = async (page: number): Promise<SmesherStates> => {
    const res = await fetchSmesherStatesChunk(rpc, PER_PAGE, page * PER_PAGE);
    if (Object.values(res).flatMap((x) => x.history).length === PER_PAGE) {
      const next = await fetchNext(page + 1);
      return mergeSmesherStates(res, next);
    }
    return res;
  };

  return fetchNext(0);
};
