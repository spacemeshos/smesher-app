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

type ItemData<T extends AnyTimelineDetails> = T extends undefined
  ? { title: string }
  : T extends AnyTimelineDetails
  ? { title: string; details: T }
  : never;

export type TimelineItem<T extends AnyTimelineDetails = AnyTimelineDetails> =
  DataItem & {
    data: ItemData<T>;
  };
