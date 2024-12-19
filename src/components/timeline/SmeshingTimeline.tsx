import { useEffect, useRef, useState } from 'react';
import { Timeline, TimelineGroup } from 'vis-timeline';

import { Box, Text, usePrevious } from '@chakra-ui/react';

import useTimelineData from '../../hooks/useTimelineData';
import { colors } from '../../theme';
import { getAbbreviatedHexString } from '../../utils/abbr';
import { SECOND } from '../../utils/constants';

import TimelineItemDetails from './TimelineItemContent';

import 'vis-timeline/dist/vis-timeline-graph2d.min.css';
import './styles.css';
import { TimelineItem } from '../../types/timeline';

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

type TooltipState = {
  x: number;
  y: number;
  arrowX?: number;
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

const calculateTooltipPosition = (
  rootElement: Element | null,
  tooltipElement: Element | null
) => {
  const selected = document.getElementsByClassName('vis-selected')[0];
  if (!rootElement || !tooltipElement || !selected) return { x: -1000, y: 0 };

  const rootBox = rootElement.getBoundingClientRect();
  const tooltipBox = tooltipElement.getBoundingClientRect();
  const selectedBox = selected.getBoundingClientRect();
  const left = selectedBox.x - rootBox.left + selectedBox.width / 2;
  const top = selectedBox.top - rootBox.top - tooltipBox.height;

  // Stick to the right edge
  if (left + tooltipBox.width / 2 > window.innerWidth - 33) {
    // If selected item is out of sight
    if (selectedBox.x > rootBox.x + rootBox.width - 15) {
      return { x: -1000, y: top };
    }

    return {
      x: window.innerWidth - tooltipBox.width / 2 - 33,
      y: top,
      arrowX: Math.min(
        left - (window.innerWidth - tooltipBox.width - 33),
        tooltipBox.width - 10
      ),
    };
  }

  // Stick to the left edge
  if (left - tooltipBox.width / 2 < 0) {
    // If selected item is out of sight
    const leftPanel = document.getElementsByClassName('vis-left')[0];
    const leftOffset = leftPanel ? leftPanel.getBoundingClientRect().width : 0;
    if (selectedBox.x + selectedBox.width < rootBox.x + leftOffset + 15) {
      return { x: -1000, y: top };
    }

    return {
      x: 0 + tooltipBox.width / 2,
      y: top,
      arrowX: Math.max(left, leftOffset + 10),
    };
  }

  // In general case
  return { x: left, y: top };
};

export default function SmeshingTimeline() {
  const ref = useRef(null);
  const chartRef = useRef<Timeline | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorTimeRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const data = useTimelineData();
  const prevGroups = usePrevious(data.nestedEventGroups);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [cursor, setCursor] = useState<CursorState>({
    x: -1000,
    content: null,
  });
  const [tooltip, setTooltip] = useState<TooltipState>({
    y: 0,
    x: -1000,
    content: null,
  });

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = new Timeline(ref.current, data.items, getGroups([]), {
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
        // update cursor time  position
        setCursor((prevState) => ({
          x: calculateCursorPosition(rootRef.current, cursorTimeRef.current),
          content: prevState.content,
        }));
        // update tooltip position
        setTooltip((prevState) => ({
          ...calculateTooltipPosition(rootRef.current, tooltipRef.current),
          content: prevState.content,
        }));
      });
      chartRef.current.on('mouseMove', (event) => {
        if (event.time && chartRef.current && cursorTimeRef.current) {
          chartRef.current.setCustomTime(event.time, 'cursor');
          setCursor({
            x: calculateCursorPosition(rootRef.current, cursorTimeRef.current),
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
            ),
          });
        }
      });
      chartRef.current.on('select', ({ items }: { items: string[] }) => {
        setTooltip((prevState) => ({
          ...prevState,
          content: (
            <>
              {items.map((id) => {
                const item = data.items.get(id) as TimelineItem;
                if (!item) {
                  return 'Unknown item';
                }
                return (
                  <div key={id}>
                    <Text mb={2} fontWeight="bold">
                      {item.data.title || item.content || 'Unknown object'}
                    </Text>
                    {item.start && item.end && (
                      <Text>
                        {item.start
                          ? new Date(item.start).toLocaleString()
                          : ''}{' '}
                        &mdash;{' '}
                        {item.end ? new Date(item.end).toLocaleString() : ''}
                      </Text>
                    )}
                    {item.start && !item.end && (
                      <Text>
                        At{' '}
                        {item.start
                          ? new Date(item.start).toLocaleString()
                          : ''}
                      </Text>
                    )}
                    <TimelineItemDetails item={item} />
                  </div>
                );
              })}
            </>
          ),
        }));

        // To ensure it will be placed correctly we need to re-update position
        // on the next tick after changing it's content
        setTimeout(() => {
          setTooltip((prevState) => ({
            ...calculateTooltipPosition(rootRef.current, tooltipRef.current),
            content: prevState.content,
          }));
        }, 0);
      });
      return;
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
    zoomedIn,
  ]);
  return (
    <Box w="100%" pos="relative" ref={rootRef}>
      <Box
        ref={cursorTimeRef}
        pos="absolute"
        zIndex={5}
        bg={colors.brand.green}
        color={colors.brand.darkGreen}
        opacity={0.75}
        left={`${cursor.x}px`}
        fontSize="x-small"
        p={1}
        top="-38px"
      >
        {cursor.content}
      </Box>
      <Box
        ref={tooltipRef}
        pos="absolute"
        zIndex={6}
        bg={colors.brand.lightAlphaGray}
        color={colors.brand.darkGreen}
        left={`${tooltip.x}px`}
        top={`${tooltip.y}px`}
        fontSize="x-small"
        p={2}
        w="300px"
        ml="-150px"
        borderRadius={2}
      >
        <div
          className="tooltip-arrow"
          style={{
            position: 'absolute',
            left: tooltip.arrowX ? `${tooltip.arrowX}px` : '50%',
            marginLeft: '-5px',
            bottom: '-5px',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `5px solid ${colors.brand.lightAlphaGray}`,
          }}
        />
        {tooltip.content}
      </Box>
      <div ref={ref} />
    </Box>
  );
}
