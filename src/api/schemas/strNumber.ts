import { z } from 'zod';

export const BigIntStringSchema = z.custom<string>((a) => {
  if (typeof a !== 'string') return false;
  try {
    return BigInt(a).toString() === a;
  } catch (err) {
    return false;
  }
});

export const BigIntMin = (min: bigint) =>
  z.custom<string>((a) => a && BigInt(a) >= min, {
    message: `Should be greater than or equal to ${String(min)}`,
  });
