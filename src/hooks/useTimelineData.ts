import { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet } from 'vis-data';

import { usePrevious } from '@chakra-ui/react';

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
  const smesherStatesStore = useSmesherStates();
  const { data: rewards } = useRewards();
  const dataSetRef = useRef(new DataSet<TimelineItem>());
  const [smesherMessages, setSmesherMessages] = useState<SmesherMessages>({});

  const smesherStates = smesherStatesStore.data?.states;

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
  // Update current time twice per layer
  //
  const [layerByTime, setLayerByTime] = useState(0);
  const [currentPoetRound, setCurrentPoetRound] = useState(0);
  useEffect(() => {
    let ival: ReturnType<typeof setInterval> | null = null;
    if (netInfo) {
      ival = setInterval(() => {
        setLayerByTime(
          getLayerByTime(netInfo.layerDuration, netInfo.genesisTime, Date.now())
        );
        if (poetInfo) {
          setCurrentPoetRound(
            getPoetRoundByTime(poetInfo.config, netInfo, Date.now())
          );
        }
      }, 5 * SECOND);
    }
    return () => {
      if (ival) clearInterval(ival);
    };
  }, [netInfo, poetInfo]);

  //
  // Calculate layers and epochs
  //
  const currentEpoch = netInfo
    ? getEpochByLayer(netInfo.layersPerEpoch, layerByTime)
    : 0;

  const epochDuration = netInfo
    ? getEpochDuration(netInfo.layerDuration, netInfo.layersPerEpoch)
    : 0;

  //
  // Computed values
  //
  const epochsToDisplay = currentEpoch + 5;
  const layersToDisplay = epochsToDisplay * (netInfo?.layersPerEpoch ?? 1);

  const prevEpochsToDisplay = usePrevious(epochsToDisplay);
  const prevLayersToDisplay = usePrevious(layersToDisplay);

  const epochsDelta = epochsToDisplay - prevEpochsToDisplay;
  const layersDelta = layersToDisplay - prevLayersToDisplay;

  // Update epochs
  useEffect(() => {
    if (!netInfo) return;
    const epochs = new Array(epochsDelta)
      .fill(null)
      .map((_, idx): TimelineItem<EpochDetails> => {
        const index = idx + prevEpochsToDisplay;
        return {
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
          className: 'epoch',
          data: {
            title: `Epoch ${index}`,
            type: TimelineItemType.Epoch,
            details: {
              identities: {},
            },
          },
        };
      });
    updateData(epochs);
  }, [epochsDelta, netInfo, prevEpochsToDisplay]);

  // Update layers
  useEffect(() => {
    if (!netInfo) return;
    const layers = new Array(layersDelta)
      .fill(null)
      .map((_, idx): TimelineItem<LayerDetails> => {
        const index = idx + prevLayersToDisplay;
        return {
          content: `${index}`,
          id: `layer_${index}`,
          group: 'layers',
          start:
            getLayerStartTime(netInfo.layerDuration, index) +
            netInfo.genesisTime,
          end:
            getLayerEndTime(netInfo.layerDuration, index) + netInfo.genesisTime,
          className: 'layer',
          data: {
            title: `Layer ${index}`,
            type: TimelineItemType.Layer,
            details: {
              identities: {},
            },
          },
        };
      });
    updateData(layers);
  }, [layersDelta, netInfo, prevLayersToDisplay]);

  // Update PoET rounds and cycle gaps
  useEffect(() => {
    if (!netInfo || !poetInfo) return;
    const data = new Array(epochsDelta)
      .fill(null)
      .flatMap((_, idx): TimelineItem<CycleGapDetails>[] => {
        const index = idx + prevEpochsToDisplay;
        // Create PoET cycle gap
        const cycleGap = (() => {
          const start = getCycleGapStart(poetInfo.config, netInfo, index);
          const end = getCycleGapEnd(poetInfo.config, netInfo, index);
          return {
            content: `CycleGap ${index}`,
            id: `poet_cycle_gap_${index}`,
            group: 'poet',
            subgroup: 'cycleGap',
            start,
            end,
            className: 'cycle-gap',
            data: {
              title: `CycleGap ${index}`,
              type: TimelineItemType.CycleGap,
            },
          };
        })();
        // Create PoET round
        const round = (() => {
          const start = getPoetRoundStart(poetInfo.config, netInfo, index);
          const end = getPoetRoundEnd(poetInfo.config, netInfo, index);
          return {
            content: `PoET Round ${index}`,
            id: `poet_round_${index}`,
            group: 'poet',
            subgroup: 'round',
            start,
            end,
            className: 'poet-round',
            data: {
              title: `PoET Round #${index}`,
              type: TimelineItemType.PoetRound,
              details: {
                identities: {},
              },
            },
          };
        })();
        // Return both
        return [cycleGap, round];
      });
    updateData(data);
  }, [epochsDelta, netInfo, poetInfo, prevEpochsToDisplay]);

  // Update events
  const smesherEventsById = useMemo(
    () => smesherStates && Object.entries(smesherStates),
    [smesherStates]
  );
  const smesherEventsAmountById = useMemo(
    () =>
      smesherEventsById
        ? Object.fromEntries(
            smesherEventsById.map(([idx, states]) => [idx, states.length])
          )
        : {},
    [smesherEventsById]
  );
  const prevSmesherEventsIdx = usePrevious(smesherEventsAmountById);
  useEffect(() => {
    if (!netInfo || !poetInfo || !smesherEventsById) return;
    const hasManyIdentities = smesherEventsById.length > 1;
    smesherEventsById.forEach(([id, states]) => {
      const delta =
        (smesherEventsAmountById[id] ?? 0) - (prevSmesherEventsIdx[id] ?? 0);
      const group = hasManyIdentities ? `smesher_${id}` : 'events';
      const smesherRewards = rewards ? rewards[id] ?? [] : [];
      const eligibilities: Record<
        number,
        Record<number, 'eligible' | 'rewarded'>
      > = {};

      const updated = <TimelineItem[]>[];

      states.slice(-delta).forEach((item) => {
        const details = SmesherEvents.pickSmesherEventDetails(item);

        // Get layer, epoch, and round numbers
        const atTime = new Date(item.time).getTime();
        const atLayer = getLayerByTime(
          netInfo.layerDuration,
          netInfo.genesisTime,
          atTime
        );
        const atEpoch = getEpochByLayer(netInfo.layersPerEpoch, atLayer);
        const atRound = getPoetRoundByTime(poetInfo.config, netInfo, atTime);

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
                    ? 'layer rewarded'
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
                          )} to ${rewarded.coinbase} (weight ${layer.count})`,
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

          const eligibleLayersString = d.layers.map((l) => l.layer).join(', ');

          setMessage(
            id,
            'success',
            // eslint-disable-next-line max-len
            `Eligible in Layers ${eligibleLayersString} in epoch ${atEpoch}`
          );

          // Mark eligible epoch
          const epoch = getData(`epoch_${atEpoch}`);
          if (epoch) {
            updated.push(
              updateItem(epoch, {
                className: 'epoch eligible',
                identities: {
                  [id]: {
                    state: IdentityState.ELIGIBLE,
                    details: `Eligible in Layers ${d.layers
                      .map((l) => l.layer)
                      .join(', ')}`,
                  },
                },
              })
            );
          }
        }

        if (item.state === SmesherEvents.EventName.PROPOSAL_PUBLISHED) {
          const data = details as SmesherEvents.ProposalPublishedEventDetails;
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
                className: 'layer rewarded',
                identities: {
                  [id]: {
                    state: IdentityState.SUCCESS,
                    details: 'Proposal published',
                  },
                },
              })
            );
          }

          // Update epoch status
          const epochItem = getData(`epoch_${atEpoch}`);
          if (epochItem) {
            const epochHasAllRewards = Object.values(
              eligibilities[atEpoch] ?? {}
            ).every((x) => x === 'rewarded');
            const epochPassed = currentEpoch > atEpoch;
            // eslint-disable-next-line no-nested-ternary
            const [className, idStatus] = epochHasAllRewards
              ? [
                  'epoch rewarded',
                  {
                    // Rewarded
                    state: IdentityState.SUCCESS,
                    details: `Got all rewards for epoch ${atEpoch}`,
                  },
                ]
              : epochPassed
              ? [
                  'epoch failed',
                  {
                    // Missed some rewards in epoch
                    state: IdentityState.FAILURE,
                    details: `Missed rewards for layers ${Object.entries(
                      eligibilities[atEpoch] ?? {}
                    )
                      .filter(([, status]) => status !== 'rewarded')
                      .map(([layerNum]) => layerNum)
                      .join(', ')}`,
                  },
                ]
              : [
                  'epoch eligible',
                  {
                    // Waiting for rewards...
                    state: IdentityState.ELIGIBLE,
                    details: `Getting rewards...`,
                  },
                ];

            if (className && idStatus) {
              updated.push(
                updateItem(epochItem, {
                  className,
                  identities: {
                    [id]: idStatus,
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
          setMessage(
            id,
            'failed',
            // eslint-disable-next-line max-len
            `${
              item.state === SmesherEvents.EventName.PROPOSAL_BUILD_FAILED
                ? 'Proposal build'
                : 'Proposal publish'
            } failed`
          );

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
          const affectedEpoch = atEpoch + 1;
          const epoch = getData(`epoch_${affectedEpoch}`);
          if (epoch) {
            const isOutdated = currentEpoch > affectedEpoch;
            if (isOutdated) {
              setMessage(
                id,
                'failed',
                // eslint-disable-next-line max-len
                `Did not published any proposal in ${affectedEpoch}`
              );
              updated.push(
                updateItem(epoch, {
                  className: 'epoch failed',
                  identities: {
                    [id]: {
                      state: IdentityState.FAILURE,
                      details: 'Missed publishing proposals',
                    },
                  },
                })
              );
            } else {
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
          const affectedEpoch = atRound + 2;
          const epoch = getData(`epoch_${affectedEpoch}`);
          if (epoch) {
            updated.push(
              updateItem(
                epoch,
                currentEpoch > affectedEpoch
                  ? {
                      className: 'epoch failed',
                      identities: {
                        [id]: {
                          state: IdentityState.FAILURE,
                          details:
                            // eslint-disable-next-line max-len
                            'Did not publish Activation Transaction in time',
                        },
                      },
                    }
                  : {
                      className: 'epoch pending',
                      identities: {
                        [id]: {
                          state: IdentityState.PENDING,
                          details:
                            // eslint-disable-next-line max-len
                            'PoET proof received, going to publish Activation Transaction',
                        },
                      },
                    }
              )
            );
          }
        }
        if (item.state === SmesherEvents.EventName.POET_REGISTERED) {
          const affectedRound = atRound + 1;
          const affectedEpoch = atRound + 2;
          const round = getData(
            `poet_round_${affectedRound}`
          ) as TimelineItem<PoetRoundDetails>;
          if (round) {
            if (currentPoetRound > affectedRound) {
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
              const epoch = getData(`epoch_${affectedEpoch + 1}`);
              if (epoch) {
                updated.push(
                  updateItem(epoch, {
                    className: 'epoch eligible',
                    identities: {
                      [id]: {
                        state: IdentityState.ELIGIBLE,
                        // eslint-disable-next-line max-len
                        details:
                          'Registered in PoET. Waiting for PoET proof...',
                      },
                    },
                  })
                );
              }
            }
          }
        }

        if (
          item.state ===
          SmesherEvents.EventName.WAITING_FOR_POET_REGISTRATION_WINDOW
        ) {
          const affectedRound = atRound + 1;
          const affectedEpoch = affectedRound + 2;
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
              const epoch = getData(`epoch_${affectedEpoch}`);
              if (epoch) {
                updated.push(
                  updateItem(epoch, {
                    className: 'epoch failed',
                    identities: {
                      [id]: {
                        state: IdentityState.FAILURE,
                        details: 'Missed PoET registration window',
                      },
                    },
                  })
                );
              }
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
  }, [
    currentEpoch,
    currentPoetRound,
    layerByTime,
    netInfo,
    poetInfo,
    prevSmesherEventsIdx,
    rewards,
    smesherEventsAmountById,
    smesherEventsById,
  ]);

  const nestedEventGroups = useMemo(() => {
    const ids = Object.keys(smesherStates || {});
    return ids.length > 1 ? ids : [];
  }, [smesherStates]);

  return {
    currentEpoch,
    genesisTime: netInfo?.genesisTime,
    epochDuration,
    items: dataSetRef.current,
    nestedEventGroups,
    smesherMessages,
  };
};

export default useTimelineData;
