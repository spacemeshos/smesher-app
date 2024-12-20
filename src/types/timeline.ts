import { DataItem } from 'vis-timeline';

import * as SmesherEvents from '../api/schemas/smesherEvents';

export type EventDetails = Exclude<SmesherEvents.AnyEventDetails, undefined>;
export type EpochDetails = undefined;
export type LayerDetails = undefined;
export type CycleGapDetails = undefined;
export type PoetRoundDetails = undefined;
export type AnyTimelineDetails =
  | EventDetails
  | EpochDetails
  | LayerDetails
  | CycleGapDetails
  | PoetRoundDetails;

export enum TimelineItemType {
  Event = 'event',
  Epoch = 'epoch',
  Layer = 'layer',
  CycleGap = 'cycleGap',
  PoetRound = 'poetRound',
}

type ItemData<T extends AnyTimelineDetails> = T extends undefined
  ? { title: string; type: TimelineItemType }
  : T extends AnyTimelineDetails
  ? { title: string; type: TimelineItemType; details: T }
  : never;

export type TimelineItem<T extends AnyTimelineDetails = AnyTimelineDetails> =
  DataItem & {
    data: ItemData<T>;
  };

export const isEventDetails = (
  i: TimelineItem
): i is TimelineItem<EventDetails> =>
  !!i.data.title && Object.hasOwn(i.data, 'details');
