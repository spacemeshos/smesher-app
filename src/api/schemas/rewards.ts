import { z } from 'zod';

import { Bech32AddressSchema } from './address';
import { Base64Schema } from './common';
import { BigIntStringSchema } from './strNumber';

export const RewardSchema = z.object({
  layer: z.number(),
  total: BigIntStringSchema,
  layerReward: BigIntStringSchema,
  coinbase: Bech32AddressSchema,
  smesher: Base64Schema,
});

export const RewardsListSchema = z.object({
  rewards: z.array(RewardSchema),
});
