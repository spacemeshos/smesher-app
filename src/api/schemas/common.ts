import parse from 'parse-duration';
import { z } from 'zod';

import { isHexString } from '../../types/common';
import { isValid } from '../../utils/base64';

export const HexStringSchema = z.custom<string>(
  (str) => {
    if (typeof str !== 'string') return false;
    return isHexString(str);
  },
  {
    message: 'Expected HEX string',
  }
);

export const PublicKeySchema = HexStringSchema.and(
  z.string().length(64, 'Public key must be 32 bytes long (64 characters)')
);

export const Base64Schema = z
  .string()
  .refine(isValid, { message: 'Expected Base64 string' });

export const DurationSchema = z
  .string()
  .refine((x) => typeof parse(x) === 'number');
