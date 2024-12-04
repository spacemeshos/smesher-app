import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';
import { SmesherStatesResponseSchema } from '../schemas/smesherStates';

export const fetchSmesherStates = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2alpha1.SmeshingIdentitiesService/States`, {
    method: 'POST',
  })
    .then(parseResponse(SmesherStatesResponseSchema))
    .then((res) => res.identities);
