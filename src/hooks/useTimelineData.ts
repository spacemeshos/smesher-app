import { useEffect, useMemo, useRef, useState } from 'react';
import { DataSet } from 'vis-data';

import * as SmesherEvents from '../api/schemas/smesherEvents';
import useNetworkInfo from '../store/useNetworkInfo';
import usePoETInfo from '../store/usePoETInfo';
import useRewards from '../store/useRewards';
import useSmesherStates from '../store/useSmesherStates';
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
  getEpochByLayer,
  getEpochDuration,
  getEpochEndTime,
  getEpochFirstLayer,
  getEpochStartTime,
  getLayerByTime,
  getLayerEndTime,
  getLayerStartTime,
  getSmesherEventTitle,
} from '../utils/timeline';

const useTimelineData = () => {
  const { data: netInfo } = useNetworkInfo();
  const { data: poetInfo } = usePoETInfo();
  const { data: smesherStates } = useSmesherStates();
  const { data: rewards } = useRewards();
  const dataSetRef = useRef(new DataSet<TimelineItem>());

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
      const poetStart = netInfo.genesisTime + poetInfo.config.phaseShift;
      const cycleGaps = new Array(epochsToDisplay)
        .fill(null)
        .map((_, index): TimelineItem<CycleGapDetails> => {
          const start =
            poetStart - poetInfo.config.cycleGap + epochDuration * index;
          const end = start + poetInfo.config.cycleGap;
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
          const start = poetStart + epochDuration * index;
          const end = start + epochDuration;
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

        history.forEach((item) => {
          const details = SmesherEvents.pickSmesherEventDetails(item);

          const updated = <TimelineItem[]>[];
          // Item Computed item's at
          const atLayer =
            (new Date(item.time).getTime() - netInfo.genesisTime) /
            (netInfo.layerDuration * SECOND);
          const atEpoch = getEpochByLayer(netInfo.layersPerEpoch, atLayer);

          type TimelineItemOpts = {
            className?: string;
            content?: string;
            identities?: Record<string, IndentityStatus>;
          };
          const timeLineItem = (
            prev: TimelineItem,
            opts: TimelineItemOpts
          ): TimelineItem => {
            const identities = {
              ...(prev.data &&
              'details' in prev.data &&
              'identities' in prev.data.details
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
                  ...(prev.data && 'details' in prev.data
                    ? prev.data.details
                    : {}),
                  identities,
                },
              },
            };
          };

          // Update epochs and layers

          if (item.state === SmesherEvents.EventName.ELIGIBLE) {
            const d = details as SmesherEvents.EligibleEventDetails;
            // Mark eligible / rewarded layers
            d.layers.forEach((layer) => {
              const eligibleLayer = getData(`layer_${layer.layer}`);
              if (eligibleLayer) {
                if (rewards && rewards[id]) {
                  const rewarded = rewards[id]?.find(
                    (r) => r.layerPaid === layer.layer
                  );
                  updated.push(
                    timeLineItem(eligibleLayer, {
                      className: rewarded ? 'layer success' : 'layer eligible',
                      identities: {
                        [id]: rewarded
                          ? {
                              state: IdentityState.SUCCESS,
                              details: `Got reward for Layer ${
                                layer.layer
                              }: ${formatSmidge(
                                rewarded.rewardForFees + rewarded.rewardForLayer
                              )} to ${rewarded.coinbase} (weight ${
                                layer.count
                              })`,
                            }
                          : {
                              state: IdentityState.PENDING,
                              details: `Eligible in Layer ${layer.layer}`,
                            },
                      },
                      content: layer.layer.toString(),
                    })
                  );
                }
              }
            });
            // Mark eligible epoch
            if (d.layers[0]?.layer) {
              const epochNum = getEpochByLayer(
                netInfo.layersPerEpoch,
                d.layers[0].layer
              );
              const epoch = getData(`epoch_${epochNum}`);
              if (epoch) {
                updated.push(
                  timeLineItem(epoch, {
                    className: 'epoch eligible',
                    identities: {
                      [id]: {
                        state: IdentityState.ELIGIBLE,
                        details: `Eligible in Epoch ${epochNum}`,
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
                timeLineItem(epoch, {
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
          }

          if (item.state === SmesherEvents.EventName.POET_REGISTERED) {
            const nextEpoch = atEpoch + 1;
            const round = getData(
              `poet_round_${nextEpoch}`
            ) as TimelineItem<PoetRoundDetails>;
            if (round) {
              updated.push(
                timeLineItem(round, {
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

          if (
            item.state ===
            SmesherEvents.EventName.WAITING_FOR_POET_REGISTRATION_WINDOW
          ) {
            // Mark next epoch...
            const nextEpochNum = atEpoch + 1;
            const nextEpoch = getData(
              `epoch_${nextEpochNum}`
            ) as TimelineItem<EpochDetails>;
            if (nextEpoch) {
              if (currentEpoch >= nextEpochNum) {
                const hasRewardsInEpoch = smesherRewards?.find(
                  (r) =>
                    r.layerPaid >=
                      getEpochFirstLayer(
                        netInfo.layersPerEpoch,
                        nextEpochNum
                      ) &&
                    r.layerPaid <
                      getEpochFirstLayer(
                        netInfo.layersPerEpoch,
                        nextEpochNum + 1
                      )
                );
                if (hasRewardsInEpoch) {
                  // Mark epoch as rewarded
                  updated.push(
                    timeLineItem(nextEpoch, {
                      className: 'epoch success',
                      identities: {
                        [id]: {
                          state: IdentityState.SUCCESS,
                          details: 'Got some rewards in the Epoch',
                        },
                      },
                    })
                  );
                } else {
                  // Mark epoch as failed
                  updated.push(
                    timeLineItem(nextEpoch, {
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
                // Mark epoch as pending
                updated.push(
                  timeLineItem(nextEpoch, {
                    className: 'epoch pending',
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

            // Mark next PoET round...
            const curRound = getData(
              `poet_round_${atEpoch}`
            ) as TimelineItem<PoetRoundDetails>;
            const nextRound = getData(
              `poet_round_${atEpoch + 1}`
            ) as TimelineItem<PoetRoundDetails>;
            if (curRound && nextRound) {
              const round =
                Date.now() < new Date(curRound.start).getTime()
                  ? curRound
                  : nextRound;
              // TODO: Mark as failed or success
              // Mark as pending
              updated.push(
                timeLineItem(round, {
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

          // Add / update data
          updateData([
            ...updated,
            {
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
            },
          ]);
        });
      });

      // End of updating data
    }
  }, [currentEpoch, epochDuration, netInfo, poetInfo, rewards, smesherStates]);

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
  };
};

export default useTimelineData;
