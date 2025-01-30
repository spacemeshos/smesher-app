import fetchJSON from '../../utils/fetchJSON';
import getFetchAll from '../getFetchAll';
import { parseResponse } from '../schemas/error';
import { SmesherStatesResponseSchema } from '../schemas/smesherStates';

const fetchSmesherStatesChunk = (
  rpc: string,
  limit: number,
  offset: number
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

export const fetchSmesherStates = getFetchAll((rpc, _, limit, offset) =>
  fetchSmesherStatesChunk(rpc, limit, offset)
);

export default fetchSmesherStates;
