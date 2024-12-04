/* eslint-disable import/prefer-default-export */
export const getAbbreviatedAddress = (address: string) =>
  `${address.split('1')[0]}1...${address.slice(-4)}`;

export const getAbbreviatedHexString = (id: string) =>
  `${id.slice(0, id.startsWith('0x') ? 6 : 4)}...${id.slice(-4)}`;
