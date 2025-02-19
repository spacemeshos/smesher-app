import { version } from '../../package.json';

// Pathname where App is hosted
export const BASE_PATH = `/version/${version}`;

// Time
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

// Intervals
export const FETCH_RETRY = 30 * SECOND;
