import { pipe } from '@mobily/ts-belt';

export const stripTrailingSlash = (str: string) =>
  str.endsWith('/') ? str.slice(0, -1) : str;

export const defaultizeHttps = (str: string) =>
  str.startsWith('https://') || str.startsWith('http://')
    ? str
    : `https://${str}`;

export const normalizeURL = (str: string) =>
  pipe(str, stripTrailingSlash, defaultizeHttps);
