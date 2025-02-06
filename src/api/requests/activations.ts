import { z } from 'zod';

import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';

// eslint-disable-next-line import/prefer-default-export
export const fetchActivationsCount = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2beta1.ActivationService/ActivationsCount`, {
    method: 'GET',
  })
    .then(parseResponse(z.object({ count: z.number() })))
    .then((res) => res.count);
