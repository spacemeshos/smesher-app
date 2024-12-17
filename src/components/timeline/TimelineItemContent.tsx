import { EventDetails, TimelineItem } from '../../types/timeline';

function TimelineItemDetails({
  item,
}: {
  item: TimelineItem<EventDetails>;
}): JSX.Element {
  return <div>{JSON.stringify(item.data.details, null, 2)}</div>;
}

export default TimelineItemDetails;
