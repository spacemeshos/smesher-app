import fetchJSON from '../../utils/fetchJSON';
import { parseResponse } from '../schemas/error';
import {
  VersionResponseSchema,
  VersionsMapResponse,
  VersionsMapResponseSchema,
} from '../schemas/version';

// Example of output:
// Promise.resolve('1.5.0');
export const fetchSmesherVersion = (rpc: string) =>
  fetchJSON(`${rpc}/spacemesh.v2beta1.SmeshingService/Version`, {
    method: 'GET',
  })
    .then(parseResponse(VersionResponseSchema))
    .then(({ version }) => version);

// Example of output:
// Promise.resolve([
//   ['0.0.1', '0.3.0'],
//   ['1.4.5', '0.5.3'],
//   ['2.0.0', '1.0.0'],
// ]);
// First column is Smesher Service minimal version
// Second column is Smesher App maximal version
// So if User is using Smesher Service v1.5.2 — it is expected
// to have Smesher App version >0.3.0 and <=0.5.3
// If Smesher App is less than specified version here —
// it will propose to update the app
export const fetchVersionsMap = (url: string): Promise<VersionsMapResponse> =>
  fetchJSON(url, {
    method: 'GET',
  }).then(parseResponse(VersionsMapResponseSchema));
