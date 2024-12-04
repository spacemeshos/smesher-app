import { Bech32Address, HexString } from './common';

export type Reward = {
  layerPaid: number;
  rewardForLayer: bigint;
  rewardForFees: bigint;
  coinbase: Bech32Address;
  smesher: HexString;
};
