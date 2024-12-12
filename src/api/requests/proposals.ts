import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';
import { ProposalsResponseSchema } from '../schemas/proposals';

// eslint-disable-next-line import/prefer-default-export
export const fetchProposals = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2alpha1.SmeshingIdentitiesService/Proposals`, {
    method: 'POST',
  })
    .then(parseResponse(ProposalsResponseSchema))
    .then((res) => res.proposals);
