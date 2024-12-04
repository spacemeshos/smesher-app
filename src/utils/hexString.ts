import { HexString } from '../types/common';

export const fromHexString = (hexString: HexString): Uint8Array => {
  const bytes: number[] = [];
  for (
    let i = hexString.startsWith('0x') ? 2 : 0;
    i < hexString.length;
    i += 2
  ) {
    bytes.push(parseInt(hexString.slice(i, i + 2), 16));
  }
  return Uint8Array.from(bytes);
};

export const toHexString = (
  bytes: Uint8Array | ArrayBuffer | number[],
  withPrefix = false
): HexString =>
  new Uint8Array(bytes).reduce(
    (str: string, byte: number) => str + byte.toString(16).padStart(2, '0'),
    withPrefix ? '0x' : ''
  );

export const normalizeHexString = (str: HexString, withPrefix = false) => {
  const trimmed = str.replace(/^0x/, '');
  return withPrefix ? `0x${trimmed}` : trimmed;
};
