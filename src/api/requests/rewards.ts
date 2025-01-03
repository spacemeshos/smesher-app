import { HexString } from '../../types/common';
import { Reward, RewardsPerIdentity } from '../../types/reward';
import { fromBase64, toBase64 } from '../../utils/base64';
import { fromHexString, toHexString } from '../../utils/hexString';
import getFetchAll from '../getFetchAll';
import { parseResponse } from '../schemas/error';
import { RewardsListSchema } from '../schemas/rewards';

export const fetchRewardsChunk = (
  rpc: string,
  smesher: HexString,
  limit = 100,
  offset = 0
) =>
  fetch(`${rpc}/spacemesh.v2alpha1.RewardService/List`, {
    method: 'POST',
    body: JSON.stringify({
      smesher: toBase64(fromHexString(smesher)),
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

export const fetchRewardsBySmesherId = getFetchAll(fetchRewardsChunk, 100);

export const fetchRewardsBySmesherIds =
  (identities: HexString[]) => async (rpc: string) => {
    const rewards = await Promise.all(
      identities.map((id) => fetchRewardsBySmesherId(rpc, id))
    );
    const result: RewardsPerIdentity = Object.fromEntries(
      rewards.map((r, i) => [identities[i], r])
    );
    return result;
  };
