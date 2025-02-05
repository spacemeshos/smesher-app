import { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet } from 'vis-data';

import * as SmesherEvents from '../api/schemas/smesherEvents';
import useNetworkInfo from '../store/useNetworkInfo';
import usePoETInfo from '../store/usePoETInfo';
import useRewards from '../store/useRewards';
import useSmesherStates from '../store/useSmesherStates';
import { HexString } from '../types/common';
import {
  CycleGapDetails,
  EpochDetails,
  IdentityState,
  IndentityStatus,
  LayerDetails,
  PoetRoundDetails,
  TimelineItem,
  TimelineItemType,
} from '../types/timeline';
import { SECOND } from '../utils/constants';
import { noop } from '../utils/func';
import { formatSmidge } from '../utils/smh';
import {
  getCycleGapEnd,
  getCycleGapStart,
  getEpochByLayer,
  getEpochDuration,
  getEpochEndTime,
  getEpochStartTime,
  getLayerByTime,
  getLayerEndTime,
  getLayerStartTime,
  getPoetRoundByTime,
  getPoetRoundEnd,
  getPoetRoundStart,
  getSmesherEventTitle,
} from '../utils/timeline';

// Helper function to update timeline item
type TimelineItemOpts = {
  className?: string;
  content?: string;
  identities?: Record<string, IndentityStatus>;
};
const updateItem = (
  prev: TimelineItem,
  opts: TimelineItemOpts
): TimelineItem => {
  const identities = {
    ...(prev.data && 'details' in prev.data && 'identities' in prev.data.details
      ? prev.data.details.identities
      : {}),
    ...opts.identities,
  };
  return {
    ...prev,
    className: opts.className || prev.className,
    data: {
      ...prev.data,
      details: {
        ...(prev.data && 'details' in prev.data ? prev.data.details : {}),
        identities,
      },
    },
  };
};

type SmesherMessage = {
  type: 'success' | 'pending' | 'failed';
  message: string;
};

type SmesherMessages = Record<HexString, SmesherMessage>;

const useTimelineData = () => {
  const { data: netInfo } = useNetworkInfo();
  const { data: poetInfo } = usePoETInfo();
  const { data: smesherStates } = useSmesherStates();
  const { data: rewards } = useRewards();
  const dataSetRef = useRef(new DataSet<TimelineItem>());
  const [smesherMessages, setSmesherMessages] = useState<SmesherMessages>({});

  const setMessage = (
    id: HexString,
    type: SmesherMessage['type'],
    message: string
  ) => {
    setSmesherMessages((prev) => ({
      ...prev,
      [id]: {
        type,
        message,
      },
    }));
  };

  const getData = (id: string) => dataSetRef.current.get(id);
  const updateData = (data: TimelineItem[]) => dataSetRef.current.update(data);

  //
  // Update current time once per layer
  //
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    if (netInfo) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, netInfo.layerDuration * SECOND);
      return () => clearInterval(interval);
    }
    return noop;
  }, [netInfo]);

  //
  // Calculate layers and epochs
  //
  const layerByTime = netInfo
    ? getLayerByTime(netInfo.layerDuration, netInfo.genesisTime, currentTime)
    : 0;
  const currentEpoch = netInfo
    ? getEpochByLayer(netInfo.layersPerEpoch, layerByTime)
    : 0;
  const epochDuration = netInfo
    ? getEpochDuration(netInfo.layerDuration, netInfo.layersPerEpoch)
    : 0;
  const currentEpochStartTime = netInfo
    ? getEpochStartTime(
        netInfo.layerDuration,
        netInfo.layersPerEpoch,
        currentEpoch
      )
    : 0;

  //
  // Compute data for the timeline
  //
  useEffect(() => {
    if (!netInfo) return;
    const epochsToDisplay = currentEpoch + 5;
    const layersToDisplay = epochsToDisplay * netInfo.layersPerEpoch;
    const smesherEventsById = smesherStates
      ? Object.entries(smesherStates)
      : [];

    // Create epochs
    const epochs = new Array(epochsToDisplay).fill(null).map(
      (_, index): TimelineItem<EpochDetails> => ({
        content: `Epoch ${index}`,
        id: `epoch_${index}`,
        group: 'epochs',
        start:
          getEpochStartTime(
            netInfo.layerDuration,
            netInfo.layersPerEpoch,
            index
          ) + netInfo.genesisTime,
        end:
          getEpochEndTime(
            netInfo.layerDuration,
            netInfo.layersPerEpoch,
            index
          ) + netInfo.genesisTime,
        // eslint-disable-next-line max-len
        // TODO: Color epochs by it's status: general / failed / eligible
        className: 'epoch',
        data: {
          title: `Epoch ${index}`,
          type: TimelineItemType.Epoch,
          details: {
            identities: {},
          },
        },
      })
    );
    updateData(epochs);

    // Create layers
    const layers = new Array(layersToDisplay).fill(null).map(
      (_, index): TimelineItem<LayerDetails> => ({
        content: `${index}`,
        id: `layer_${index}`,
        group: 'layers',
        start:
          getLayerStartTime(netInfo.layerDuration, index) + netInfo.genesisTime,
        end:
          getLayerEndTime(netInfo.layerDuration, index) + netInfo.genesisTime,
        // TODO: Color layers with estimated or received rewards
        className: 'layer',
        data: {
          title: `Layer ${index}`,
          type: TimelineItemType.Layer,
          details: {
            identities: {},
          },
        },
      })
    );
    updateData(layers);

    if (poetInfo) {
      // Create PoET cycle gaps
      const cycleGaps = new Array(epochsToDisplay)
        .fill(null)
        .map((_, index): TimelineItem<CycleGapDetails> => {
          const start = getCycleGapStart(poetInfo.config, netInfo, index);
          const end = getCycleGapEnd(poetInfo.config, netInfo, index);
          return {
            content: `CycleGap ${index}`,
            id: `poet_cycle_gap_${index}`,
            group: 'poet',
            subgroup: 'cycleGap',
            start,
            end,
            className: 'cycle-gap', // TODO: color by status
            data: {
              title: `CycleGap ${index}`,
              type: TimelineItemType.CycleGap,
            },
          };
        });
      updateData(cycleGaps);

      // Create PoET rounds
      const rounds = new Array(epochsToDisplay)
        .fill(null)
        .map((_, index): TimelineItem<PoetRoundDetails> => {
          const start = getPoetRoundStart(poetInfo.config, netInfo, index);
          const end = getPoetRoundEnd(poetInfo.config, netInfo, index);
          return {
            content: `PoET Round ${index}`,
            id: `poet_round_${index}`,
            group: 'poet',
            subgroup: 'round',
            start,
            end,
            className: 'poet-round', // TODO: color by status
            data: {
              title: `PoET Round #${index}`,
              type: TimelineItemType.PoetRound,
              details: {
                identities: {},
              },
            },
          };
        });
      updateData(rounds);

      // Events
      smesherEventsById.forEach(([id, { history }]) => {
        const group = smesherEventsById.length > 1 ? `smesher_${id}` : 'events';
        const smesherRewards = rewards ? rewards[id] ?? [] : [];
        // Record<EpochNumber, Record<LayerNumber, >>
        const eligibilities: Record<
          number,
          Record<number, 'eligible' | 'rewarded' | 'missed'>
        > = {};

        const updated = <TimelineItem[]>[];
        history
          .sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
          )
          .forEach((item) => {
            const details = SmesherEvents.pickSmesherEventDetails(item);

            // Get layer, epoch, and round numbers
            const atTime = new Date(item.time).getTime();
            const atLayer = getLayerByTime(
              netInfo.layerDuration,
              netInfo.genesisTime,
              atTime
            );
            const atEpoch = getEpochByLayer(netInfo.layersPerEpoch, atLayer);
            const atRound = getPoetRoundByTime(
              poetInfo.config,
              netInfo,
              atTime
            );

            const affectedRound = atRound + 1;
            const affectedEpoch = affectedRound + 1;

            // Update epochs and layers

            if (item.state === SmesherEvents.EventName.ELIGIBLE) {
              const d = details as SmesherEvents.EligibleEventDetails;
              // Mark eligible / rewarded layers
              d.layers.forEach((layer) => {
                const eligibleLayer = getData(`layer_${layer.layer}`);
                if (eligibleLayer) {
                  const rewarded = smesherRewards.find(
                    (r) => r.layerPaid === layer.layer
                  );
                  const missed = !rewarded && layerByTime > layer.layer;
                  eligibilities[atEpoch] = {
                    ...eligibilities[atEpoch],
                    [layer.layer]: rewarded ? 'rewarded' : 'eligible',
                  };
                  updated.push(
                    updateItem(eligibleLayer, {
                      // eslint-disable-next-line no-nested-ternary
                      className: rewarded
                        ? 'layer success'
                        : missed
                        ? 'layer failed'
                        : 'layer eligible',
                      identities: {
                        // eslint-disable-next-line no-nested-ternary
                        [id]: rewarded
                          ? {
                              state: IdentityState.SUCCESS,
                              details: `Got reward for Layer ${
                                layer.layer
                              }: ${formatSmidge(
                                // eslint-disable-next-line max-len
                                rewarded.rewardForFees + rewarded.rewardForLayer
                              )} to ${rewarded.coinbase} (weight ${
                                layer.count
                              })`,
                            }
                          : missed
                          ? {
                              state: IdentityState.FAILURE,
                              // eslint-disable-next-line max-len
                              details: `Missed publishing proposal at layer ${layer.layer}`,
                            }
                          : {
                              state: IdentityState.ELIGIBLE,
                              details: `Eligible in Layer ${layer.layer}`,
                            },
                      },
                      content: layer.layer.toString(),
                    })
                  );
                }
              });

              setMessage(
                id,
                'success',
                // eslint-disable-next-line max-len
                `Eligible in Layers ${d.layers.map((l) => l.layer).join(', ')}`
              );
            }

            if (item.state === SmesherEvents.EventName.PROPOSAL_PUBLISHED) {
              const data =
                details as SmesherEvents.ProposalPublishedEventDetails;
              const layer = getData(`layer_${data.layer}`);
              if (layer) {
                setMessage(
                  id,
                  'success',
                  // eslint-disable-next-line max-len
                  `Proposal published for Layer ${data.layer} in epoch ${atEpoch}`
                );
                updated.push(
                  updateItem(layer, {
                    className: 'layer success',
                    identities: {
                      [id]: {
                        state: IdentityState.SUCCESS,
                        details: 'Proposal published',
                      },
                    },
                  })
                );
              }

              if (
                Object.values(eligibilities[atEpoch] ?? {}).every(
                  (x) => x === 'rewarded'
                )
              ) {
                const epochItem = getData(`epoch_${atEpoch}`);
                if (epochItem) {
                  updated.push(
                    updateItem(epochItem, {
                      className: 'epoch rewarded',
                      identities: {
                        [id]: {
                          state: IdentityState.SUCCESS,
                          // eslint-disable-next-line max-len
                          details: `Got all rewards for epoch ${atEpoch}`,
                        },
                      },
                    })
                  );
                }
              }
            }

            if (
              item.state === SmesherEvents.EventName.PROPOSAL_BUILD_FAILED ||
              item.state === SmesherEvents.EventName.PROPOSAL_PUBLISH_FAILED
            ) {
              const epoch = getData(`epoch_${atEpoch}`);
              if (epoch) {
                updated.push(
                  updateItem(epoch, {
                    className: 'epoch failed',
                    identities: {
                      [id]: {
                        state: IdentityState.FAILURE,
                        details: (
                          details as
                            | SmesherEvents.ProposalPublishFailedEventDetails
                            | SmesherEvents.ProposalBuildFailedEventDetails
                        ).message,
                      },
                    },
                  })
                );
              }

              const layer = getData(`layer_${atLayer}`);
              if (layer) {
                updated.push(
                  updateItem(layer, {
                    className: 'layer failed',
                    identities: {
                      [id]: {
                        state: IdentityState.FAILURE,
                        details: `${
                          item.state ===
                          SmesherEvents.EventName.PROPOSAL_BUILD_FAILED
                            ? 'Proposal build'
                            : 'Proposal publish'
                        } failed: ${
                          (
                            details as
                              | SmesherEvents.ProposalPublishFailedEventDetails
                              | SmesherEvents.ProposalBuildFailedEventDetails
                          ).message
                        }`,
                      },
                    },
                  })
                );
              }
            }

            if (item.state === SmesherEvents.EventName.GENERATING_POST_PROOF) {
              setMessage(id, 'success', 'Generating PoST proof...');
            }

            if (item.state === SmesherEvents.EventName.ATX_BROADCASTED) {
              const epoch = getData(`epoch_${affectedEpoch}`);
              if (epoch) {
                setMessage(
                  id,
                  'success',
                  // eslint-disable-next-line max-len
                  `ATX is broadcasted in epoch ${affectedEpoch}`
                );
                updated.push(
                  updateItem(epoch, {
                    className: 'epoch eligible',
                    identities: {
                      [id]: {
                        state: IdentityState.ELIGIBLE,
                        details: 'ATX is broadcasted. Waiting for rewards...',
                      },
                    },
                  })
                );
              }
            }

            if (item.state === SmesherEvents.EventName.POET_PROOF_RECEIVED) {
              const round = getData(`poet_round_${atRound}`);
              if (round) {
                setMessage(
                  id,
                  'success',
                  // eslint-disable-next-line max-len
                  `PoET proof received in round ${atRound}`
                );
                updated.push(
                  updateItem(round, {
                    className: 'poet-round success',
                    identities: {
                      [id]: {
                        state: IdentityState.SUCCESS,
                        details: 'PoET proof received',
                      },
                    },
                  })
                );
              }
              const epoch = getData(`epoch_${affectedEpoch}`);
              if (epoch) {
                updated.push(
                  updateItem(epoch, {
                    className: 'epoch pending',
                    identities: {
                      [id]: {
                        state: IdentityState.PENDING,
                        details:
                          // eslint-disable-next-line max-len
                          'PoET proof received, going to publish Activation Transaction',
                      },
                    },
                  })
                );
              }
            }
            if (item.state === SmesherEvents.EventName.POET_REGISTERED) {
              const round = getData(
                `poet_round_${affectedRound}`
              ) as TimelineItem<PoetRoundDetails>;
              if (round) {
                if (
                  currentTime >
                  getPoetRoundEnd(poetInfo.config, netInfo, affectedRound)
                ) {
                  setMessage(
                    id,
                    'failed',
                    // eslint-disable-next-line max-len
                    `Did not received PoET proof for round ${affectedRound} in time. Will not have rewards in epoch ${affectedEpoch}`
                  );
                  updated.push(
                    updateItem(round, {
                      className: 'poet-round failed',
                      identities: {
                        [id]: {
                          state: IdentityState.FAILURE,
                          // eslint-disable-next-line max-len
                          details: `Did not received PoET proof for round ${affectedRound} in time`,
                        },
                      },
                    })
                  );
                  const epoch = getData(`epoch_${affectedEpoch}`);
                  if (epoch) {
                    updated.push(
                      updateItem(epoch, {
                        className: 'epoch failed',
                        identities: {
                          [id]: {
                            state: IdentityState.FAILURE,
                            // eslint-disable-next-line max-len
                            details: `Did not received PoET proof for round ${affectedRound} in time`,
                          },
                        },
                      })
                    );
                  }
                } else {
                  setMessage(
                    id,
                    'success',
                    // eslint-disable-next-line max-len
                    `Registered in PoET round ${affectedRound}`
                  );
                  updated.push(
                    updateItem(round, {
                      className: 'poet-round eligible',
                      identities: {
                        [id]: {
                          state: IdentityState.ELIGIBLE,
                          details: 'Registered in PoET',
                        },
                      },
                    })
                  );
                }
              }
            }

            if (
              item.state ===
              SmesherEvents.EventName.WAITING_FOR_POET_REGISTRATION_WINDOW
            ) {
              // Mark next PoET round...
              const nextRound = getData(
                `poet_round_${affectedRound}`
              ) as TimelineItem<PoetRoundDetails>;
              if (nextRound) {
                // TODO: Mark as failed or success
                const roundNow = getPoetRoundByTime(
                  poetInfo.config,
                  netInfo,
                  Date.now()
                );
                // Mark as failed due to missing it
                if (affectedRound < roundNow) {
                  setMessage(
                    id,
                    'failed',
                    `Missed PoET registration window in round ${affectedRound}`
                  );
                  updated.push(
                    updateItem(nextRound, {
                      className: 'poet-round failed',
                      identities: {
                        [id]: {
                          state: IdentityState.FAILURE,
                          details: 'Missed PoET registration window',
                        },
                      },
                    })
                  );
                } else {
                  // Mark as pending
                  setMessage(
                    id,
                    'pending',
                    // eslint-disable-next-line max-len
                    `Waiting for PoET registration window in round ${affectedRound}`
                  );
                  updated.push(
                    updateItem(nextRound, {
                      className: 'poet-round pending',
                      identities: {
                        [id]: {
                          state: IdentityState.PENDING,
                          details: 'Waiting for PoET registration window',
                        },
                      },
                    })
                  );
                }
              }
            }

            // Add / update data
            updated.push({
              content: getSmesherEventTitle(item.state),
              id: `smeshing_${id}_${item.state}_${item.time}`,
              group,
              subgroup: item.state,
              start: new Date(item.time).getTime(),
              type: 'point',
              className:
                item.state === SmesherEvents.EventName.RETRYING ||
                item.state === SmesherEvents.EventName.PROPOSAL_BUILD_FAILED ||
                item.state === SmesherEvents.EventName.PROPOSAL_PUBLISH_FAILED
                  ? 'smesher-event failure'
                  : 'smesher-event',
              data: {
                title: getSmesherEventTitle(item.state),
                type: TimelineItemType.Event,
                details,
              },
            });
          });

        if (rewards && rewards[id]) {
          rewards[id]?.forEach((reward) => {
            const layer = getData(`layer_${reward.layerPaid}`);
            if (layer) {
              updated.push(
                updateItem(layer, {
                  className: 'layer rewarded',
                  identities: {
                    [id]: {
                      state: IdentityState.SUCCESS,
                      details: `Got reward for Layer ${
                        reward.layerPaid
                      }: ${formatSmidge(
                        reward.rewardForFees + reward.rewardForLayer
                      )} to ${reward.coinbase}`,
                    },
                  },
                })
              );
            }
          });
        }

        updateData(updated);
      });
      // End of updating data
    }
  }, [
    currentEpoch,
    epochDuration,
    layerByTime,
    netInfo,
    poetInfo,
    rewards,
    smesherStates,
  ]);

  const nestedEventGroups = useMemo(() => {
    const ids = Object.keys(smesherStates || {});
    return ids.length > 1 ? ids : [];
  }, [smesherStates]);

  return {
    currentEpoch,
    currentEpochStartTime,
    genesisTime: netInfo?.genesisTime,
    epochDuration,
    items: dataSetRef.current,
    nestedEventGroups,
    smesherMessages,
  };
};

export default useTimelineData;
