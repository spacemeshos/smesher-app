import { useEffect, useRef, useState } from 'react';
import { Timeline, TimelineGroup } from 'vis-timeline';

import { Box, Text, usePrevious } from '@chakra-ui/react';

import useTimelineData from '../../hooks/useTimelineData';
import { colors } from '../../theme';
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

type CursorState = {
  x: number;
  content: null | JSX.Element;
};

const pad2 = (time: number) => String(time).padStart(2, '0');

const calculateCursorPosition = (
  rootElement: Element | null,
  cursorTimeElement: Element | null
) => {
  // If no custom cursor found — hide time tooltip
  const cursorElement = document.getElementsByClassName('vis-custom-time')[0];
  if (!cursorElement) return -1000;

  // In general case — position it on top right of the cursor
  const { left } = cursorElement.getBoundingClientRect();
  const rootOffset = rootElement ? rootElement.getBoundingClientRect().left : 0;
  const leftPos = left - rootOffset;

  // If cursor is in the left panel (out of timeline) — hide time tooltip
  const leftPanel = document.getElementsByClassName('vis-left')[0];
  if (leftPanel) {
    const leftPanelBox = leftPanel.getBoundingClientRect();
    if (leftPos < leftPanelBox.width) return -1000;
  }

  // If cursor is on the right edge of the screen — flip tooltip to the left
  if (cursorTimeElement) {
    const cursorBox = cursorTimeElement.getBoundingClientRect();
    const flip =
      leftPos + cursorBox.width + 20 > window.innerWidth ? -cursorBox.width : 0;
    return leftPos + flip;
  }

  // Return general case
  return leftPos;
};

export default function SmeshingTimeline() {
  const ref = useRef(null);
  const chartRef = useRef<Timeline | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorTimeRef = useRef<HTMLDivElement | null>(null);
  const data = useTimelineData();
  const prevItems = usePrevious(data.items);
  const prevGroups = usePrevious(data.nestedEventGroups);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [cursor, setCursor] = useState<CursorState>({
    x: -1000,
    content: null,
  });

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

      chartRef.current.addCustomTime(0, 'cursor');
      chartRef.current.on('rangechange', () => {
        const left = calculateCursorPosition(
          rootRef.current,
          cursorTimeRef.current
        );
        setCursor((prevState) => ({
          x: left,
          content: prevState.content,
        }));
      });
      chartRef.current.on('mouseMove', (event) => {
        if (event.time && chartRef.current && cursorTimeRef.current) {
          chartRef.current.setCustomTime(event.time, 'cursor');
          const left = calculateCursorPosition(
            rootRef.current,
            cursorTimeRef.current
          );
          setCursor({
            x: left,
            content: (
              <>
                <Text>
                  {pad2(event.time.getHours())}:{pad2(event.time.getMinutes())}:
                  {pad2(event.time.getSeconds())}
                </Text>
                <Text>
                  {pad2(event.time.getDate())}.{pad2(event.time.getMonth() + 1)}
                  .{event.time.getFullYear()}
                </Text>
              </>
            ), // event.time,
          });
        }
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
  return (
    <Box w="100%" pos="relative" ref={rootRef}>
      <Box
        pos="absolute"
        zIndex={5}
        bg={colors.brand.green}
        color={colors.brand.darkGreen}
        opacity={0.75}
        left={cursor.x}
        fontSize="x-small"
        p={1}
        top="-38px"
        ref={cursorTimeRef}
      >
        {cursor.content}
      </Box>
      {/* TODO: Tooltip for selected items */}
      <div ref={ref} />
    </Box>
  );
}
