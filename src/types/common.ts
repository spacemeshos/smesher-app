export type HexString = string;

export type PublicKey = Uint8Array;

export type Bech32Address = string;

export type BigIntString = string;

// Guards

export const isHexString = (str: string): str is HexString =>
  /^(0x)?[0-9a-fA-F]+$/.test(str);
