import * as GLOBAL from '../../global';
import { version } from '../../package.json';

import { normalizeURL } from './url';

// Env getters
export const VERSIONS_JSON_URL = normalizeURL(
  process.env.VERSIONS_JSON_URL || GLOBAL.VERSIONS_JSON_URL
);

export const HOSTED_APP_URL = normalizeURL(
  process.env.OFFICIAL_HOSTED_URL || GLOBAL.OFFICIAL_HOSTED_URL
);

export const APP_VERSION = process.env.APP_VERSION || version;

//
// Pathname where App is hosted
//
export const BASE_PATH = `/version/${APP_VERSION}`;

//
// Time
//
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

//
// Intervals
//
export const FETCH_RETRY = 30 * SECOND;
