import { bech32 } from 'bech32';
import { z } from 'zod';

// eslint-disable-next-line import/prefer-default-export
export const Bech32AddressSchema = z.custom<string>(
  (addr) => {
    if (typeof addr !== 'string') return false;
    try {
      const p = bech32.decode(addr);
      if (!['sm', 'stest', 'standalone'].includes(p.prefix)) return false;
      if (bech32.fromWords(p.words).length !== 24) return false;
      return true;
    } catch (err) {
      return false;
    }
  },
  {
    message: 'Invalid address',
  }
);
