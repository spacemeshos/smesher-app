import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';
import { SmesherStatesResponseSchema } from '../schemas/smesherStates';

// eslint-disable-next-line import/prefer-default-export
export const fetchSmesherStates = (rpc: string, limit = 100) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  return fetchJSON(
    `${rpc}/spacemesh.v2beta1.SmeshingIdentitiesService/States?${params}`,
    {
      method: 'GET',
    }
  )
    .then(parseResponse(SmesherStatesResponseSchema))
    .then((res) => res.identities);
};
