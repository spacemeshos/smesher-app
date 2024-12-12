import { SECOND } from '../utils/constants';
import * as timeUtils from '../utils/timeline';

describe('Timeline Utils', () => {
  it('getCurrentEpochByLayer', () => {
    expect(timeUtils.getCurrentEpochByLayer(10, 0)).toBe(0);
    expect(timeUtils.getCurrentEpochByLayer(10, 10)).toBe(1);
    expect(timeUtils.getCurrentEpochByLayer(10, 25)).toBe(2);
    expect(timeUtils.getCurrentEpochByLayer(10, 9)).toBe(0);

    expect(timeUtils.getCurrentEpochByLayer(6, 65)).toBe(10);
  });

  it('getEpochFirstLayer', () => {
    expect(timeUtils.getEpochFirstLayer(10, 0)).toBe(0);
    expect(timeUtils.getEpochFirstLayer(10, 3)).toBe(30);

    expect(timeUtils.getEpochFirstLayer(6, 3)).toBe(18);
  });

  it('getEpochLastLayer', () => {
    expect(timeUtils.getEpochLastLayer(10, 0)).toBe(9);
    expect(timeUtils.getEpochLastLayer(10, 2)).toBe(29);
    expect(timeUtils.getEpochLastLayer(10, 2)).toBe(29);

    expect(timeUtils.getEpochLastLayer(6, 6)).toBe(41);
  });

  it('getLayerStartTime', () => {
    expect(timeUtils.getLayerStartTime(10, 0)).toBe(0);
    expect(timeUtils.getLayerStartTime(10, 1)).toBe(10 * SECOND);
    expect(timeUtils.getLayerStartTime(10, 5)).toBe(50 * SECOND);

    expect(timeUtils.getLayerStartTime(6, 5)).toBe(30 * SECOND);
  });

  it('getLayerEndTime', () => {
    expect(timeUtils.getLayerEndTime(10, 0)).toBe(10 * SECOND - 1);
    expect(timeUtils.getLayerEndTime(10, 4)).toBe(50 * SECOND - 1);

    expect(timeUtils.getLayerEndTime(6, 4)).toBe(30 * SECOND - 1);
  });

  it('getEpochStartTime', () => {
    expect(timeUtils.getEpochStartTime(10, 5, 0)).toBe(0);
    expect(timeUtils.getEpochStartTime(10, 5, 1)).toBe(50 * SECOND);

    expect(timeUtils.getEpochStartTime(6, 5, 1)).toBe(30 * SECOND);
  });

  it('getEpochEndTime', () => {
    expect(timeUtils.getEpochEndTime(10, 5, 0)).toBe(50 * SECOND - 1);
    expect(timeUtils.getEpochEndTime(10, 5, 3)).toBe(200 * SECOND - 1);

    expect(timeUtils.getEpochEndTime(6, 5, 3)).toBe(120 * SECOND - 1);
  });

  it('getTimeToNextEpochStart', () => {
    expect(timeUtils.getTimeToNextEpochStart(10, 5, 0)).toBe(50 * SECOND);
    expect(timeUtils.getTimeToNextEpochStart(10, 5, 5)).toBe(50 * SECOND);

    expect(timeUtils.getTimeToNextEpochStart(6, 5, 0)).toBe(30 * SECOND);
    expect(timeUtils.getTimeToNextEpochStart(6, 5, 5)).toBe(30 * SECOND);
  });

  it('getEpochDuration', () => {
    expect(timeUtils.getEpochDuration(10, 5)).toBe(50 * SECOND);
    expect(timeUtils.getEpochDuration(6, 5)).toBe(30 * SECOND);
  });
});
