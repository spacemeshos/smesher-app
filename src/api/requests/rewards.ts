import { Bech32Address } from '../../types/common';
import { Reward } from '../../types/reward';
import { fromBase64 } from '../../utils/base64';
import { toHexString } from '../../utils/hexString';
import { parseResponse } from '../schemas/error';
import { RewardsListSchema } from '../schemas/rewards';

import getFetchAll from '../getFetchAll';

export const fetchRewardsChunk = (
  rpc: string,
  address: Bech32Address,
  limit = 100,
  offset = 0
) =>
  fetch(`${rpc}/spacemesh.v2alpha1.RewardService/List`, {
    method: 'POST',
    body: JSON.stringify({
      coinbase: address,
      limit,
      offset,
    }),
  })
    .then((r) => r.json())
    .then(parseResponse(RewardsListSchema))
    .then(({ rewards }) =>
      rewards.map(
        (reward): Reward => ({
          layerPaid: reward.layer,
          rewardForLayer: BigInt(reward.layerReward),
          rewardForFees: BigInt(
            BigInt(reward.total) - BigInt(reward.layerReward)
          ),
          coinbase: reward.coinbase,
          smesher: toHexString(fromBase64(reward.smesher)),
        })
      )
    );

export const fetchRewardsByAddress = getFetchAll(fetchRewardsChunk, 100);
