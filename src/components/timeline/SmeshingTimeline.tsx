import { useEffect, useRef, useState } from 'react';
import { Timeline, TimelineGroup } from 'vis-timeline';

import { Box, Text, useOutsideClick, usePrevious } from '@chakra-ui/react';

import useTimelineData from '../../hooks/useTimelineData';
import useNetworkInfo from '../../store/useNetworkInfo';
import { colors } from '../../theme';
import { HexString } from '../../types/common';
import {
  IdentityState,
  IndentityStatus,
  TimelineItem,
} from '../../types/timeline';
import { getAbbreviatedHexString } from '../../utils/abbr';
import { SECOND } from '../../utils/constants';
import { sortHexString } from '../../utils/hexString';

import TimelineItemDetails from './TimelineItemContent';

import 'vis-timeline/dist/vis-timeline-graph2d.min.css';
import './styles.css';
import { useDebounce } from '@uidotdev/usehooks';

const DEFAULT_ZOOM_MAX = 60 * SECOND * 60 * 24 * 365; // Year

type GetGroupsParams = {
  smesherIds?: string[];
  isLayerBorderHidden?: boolean;
  isLayersOptimized?: boolean;
};
const getGroups = ({
  smesherIds = [],
  isLayerBorderHidden = false,
  isLayersOptimized = false,
}: GetGroupsParams): TimelineGroup[] => [
  { id: 'epochs', content: 'Epochs' },
  {
    id: 'layers',
    content: 'Layers',
    className: isLayerBorderHidden ? 'hidden' : '',
    visible: !isLayersOptimized,
  },
  {
    id: 'layers_optimized',
    content: 'Layers',
    visible: isLayersOptimized,
  },
  { id: 'poet', content: 'PoET' },
  {
    id: 'events',
    content: 'Events',
    showNested: false,
    nestedGroups:
      smesherIds.length > 1
        ? smesherIds.sort(sortHexString).map((id) => `smesher_${id}`)
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

const getSmesherMarkers = (
  ids: Record<HexString, IndentityStatus>,
  order: HexString[]
) => {
  const markers = Object.entries(ids)
    .sort(([a], [b]) => sortHexString(a, b))
    .map(([id, data]) => {
      const num = order.indexOf(id);
      const numStr = num === -1 ? '?' : String(num + 1);

      const { state, details } = data;
      const newEl = document.createElement('div');
      newEl.title = `${details}\n${id}`;
      newEl.innerText = numStr;

      switch (state) {
        case IdentityState.IDLE: {
          newEl.className = 'id-marker idle';
          break;
        }
        case IdentityState.PENDING: {
          newEl.className = 'id-marker pending';
          break;
        }
        case IdentityState.ELIGIBLE: {
          newEl.className = 'id-marker eligible';
          break;
        }
        case IdentityState.SUCCESS: {
          newEl.className = 'id-marker success';
          break;
        }
        case IdentityState.FAILURE: {
          newEl.className = 'id-marker failed';
          break;
        }
        default: {
          return null;
        }
      }

      return newEl;
    });
  return markers;
};

export default function SmeshingTimeline() {
  const ref = useRef(null);
  const chartRef = useRef<Timeline | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorTimeRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const data = useTimelineData();
  const { data: netInfo } = useNetworkInfo();
  const prevGroups = usePrevious(data.nestedEventGroups);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_MAX);
  const [cursor, setCursor] = useState<CursorState>({
    x: -1000,
    content: null,
  });
  const [tooltip, setTooltip] = useState<TooltipState>({
    y: 0,
    x: -1000,
    content: null,
  });
  const smesherIds = useRef<HexString[]>([]);

  useOutsideClick({
    ref: rootRef,
    handler: () => {
      if (chartRef.current) {
        setTooltip((prevState) => ({
          ...prevState,
          x: -1000,
        }));
        chartRef.current.setSelection([]);
      }
    },
  });

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = new Timeline(ref.current, data.items, getGroups({}), {
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
        template: (item) => {
          if ('details' in item.data && 'identities' in item.data.details) {
            const tpl = document.createElement('div');

            const title = document.createElement('span');
            title.innerHTML = item.content;

            const identities = document.createElement('div');
            identities.className = 'identities';

            getSmesherMarkers(
              item.data.details.identities,
              smesherIds.current ?? []
            ).forEach((el) => {
              if (!el) return;
              if (typeof el === 'string') {
                const span = document.createElement('span');
                span.innerHTML = el;
                identities.appendChild(span);
                return;
              }
              identities.appendChild(el);
            });

            tpl.appendChild(title);
            tpl.appendChild(identities);

            return tpl;
          }
          return `<div>${item.content}</div>`;
        },
      });

      chartRef.current.addCustomTime(0, 'cursor');
      chartRef.current.on('rangechange', (e) => {
        const deltaTime = e.end - e.start;
        setZoom(deltaTime);
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
                    <TimelineItemDetails item={item} order={smesherIds} />
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
    }
  }, [
    data.epochDuration,
    data.genesisTime,
    data.items,
    data.nestedEventGroups,
    smesherIds,
  ]);

  // Calculate flags depending on zoom level
  const [isLayerBorderHidden, setLayerBorderHidden] = useState(false);
  const [isLayersOptimized, setLayersOptimized] = useState(false);
  const prevLayerBorderHidden = usePrevious(isLayerBorderHidden);
  const prevLayersOptimized = usePrevious(isLayersOptimized);
  useEffect(() => {
    if (!netInfo) return;
    setLayerBorderHidden(zoom / 1000 > netInfo.layerDuration * 100);
    setLayersOptimized(zoom / 1000 > netInfo.layerDuration * 500);
  }, [netInfo, zoom]);

  // Update groups and their flags
  useEffect(() => {
    if (!chartRef.current || !netInfo) return;
    if (
      prevGroups === data.nestedEventGroups &&
      isLayerBorderHidden === prevLayerBorderHidden &&
      isLayersOptimized === prevLayersOptimized
    )
      return;

    const ids = data.nestedEventGroups.sort(sortHexString);
    const newGroups = getGroups({
      smesherIds: ids,
      isLayerBorderHidden,
      isLayersOptimized,
    });
    chartRef.current?.setGroups(newGroups);
    smesherIds.current = ids;
  }, [
    data.nestedEventGroups,
    isLayerBorderHidden,
    isLayersOptimized,
    netInfo,
    prevGroups,
    prevLayerBorderHidden,
    prevLayersOptimized,
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
