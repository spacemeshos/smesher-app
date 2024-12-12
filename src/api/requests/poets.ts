import parse from 'parse-duration';

import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';
import { PoETInfoResponseSchema } from '../schemas/poets';

// eslint-disable-next-line import/prefer-default-export
export const fetchPoETInfo = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2alpha1.SmeshingIdentitiesService/PoetInfo`, {
    method: 'POST',
  })
    .then(parseResponse(PoETInfoResponseSchema))
    .then((res) => ({
      ...res,
      config: {
        phaseShift: parse(res.config.phaseShift) || 0,
        cycleGap: parse(res.config.cycleGap) || 0,
      },
    }));
