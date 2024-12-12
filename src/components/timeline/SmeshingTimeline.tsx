import { useEffect, useRef, useState } from 'react';
import { Timeline, TimelineGroup } from 'vis-timeline';

import { usePrevious } from '@chakra-ui/react';

import useTimelineData from '../../hooks/useTimelineData';
import { getAbbreviatedHexString } from '../../utils/abbr';
import { SECOND } from '../../utils/constants';

import 'vis-timeline/dist/vis-timeline-graph2d.min.css';
import './styles.css';

const DEFAULT_ZOOM_MAX = 60 * SECOND * 60 * 24 * 365; // Year

const getGroups = (smesherIds: string[]): TimelineGroup[] => [
  { id: 'epochs', content: 'Epochs' },
  { id: 'layers', content: 'Layers' },
  { id: 'poet', content: 'PoET' },
  {
    id: 'events',
    content: 'Events',
    showNested: smesherIds.length > 1,
    nestedGroups:
      smesherIds.length > 1
        ? smesherIds.map((id) => `smesher_${id}`)
        : undefined,
  },
  ...smesherIds.map(
    (id): TimelineGroup => ({
      id: `smesher_${id}`,
      content: getAbbreviatedHexString(id),
    })
  ),
];

export default function SmeshingTimeline() {
  const ref = useRef(null);
  const chartRef = useRef<Timeline | null>(null);
  const data = useTimelineData();
  const prevItems = usePrevious(data.items);
  const prevGroups = usePrevious(data.nestedEventGroups);
  const [zoomedIn, setZoomedIn] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = new Timeline(ref.current, [], getGroups([]), {
        autoResize: true,
        showCurrentTime: true,
        preferZoom: true,
        zoomMin: 60 * SECOND,
        zoomMax: DEFAULT_ZOOM_MAX,
        editable: false,
        orientation: 'bottom',
        groupHeightMode: 'fitItems',
        margin: {
          axis: 0,
          item: {
            horizontal: 0,
            vertical: 0,
          },
        },
        rollingMode: {
          follow: true,
          offset: 0.5,
        },
        stack: false,
      });
      return;
    }

    if (prevItems !== data.items) {
      chartRef.current.setItems(data.items);
    }

    if (!zoomedIn && data.epochDuration) {
      chartRef.current.setOptions({
        zoomMax: data.epochDuration * 5,
      });
      setTimeout(() => {
        chartRef.current?.setOptions({
          zoomMax: DEFAULT_ZOOM_MAX,
        });
      }, 1000); // Wait to ensure it were re-rendered
      setZoomedIn(true);
    }

    if (prevGroups !== data.nestedEventGroups) {
      chartRef.current.setGroups(getGroups(data.nestedEventGroups));
    }
  }, [
    data.epochDuration,
    data.genesisTime,
    data.items,
    data.nestedEventGroups,
    prevGroups,
    prevItems,
    zoomedIn,
  ]);
  return <div ref={ref} />;
}
