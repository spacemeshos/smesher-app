import fetchJSON from '../../utils/fetchJSON';
import { EligibilitiesResponseSchema } from '../schemas/eligibilities';
import { parseResponse } from '../schemas/error';

// eslint-disable-next-line import/prefer-default-export
export const fetchEligibilities = (rpc: string) =>
  fetchJSON(
    `${rpc}/spacemesh.v2alpha1.SmeshingIdentitiesService/Eligibilities`,
    {
      method: 'POST',
    }
  )
    .then(parseResponse(EligibilitiesResponseSchema))
    .then((res) => res.identities);
