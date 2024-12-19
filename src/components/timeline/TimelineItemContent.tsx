import { isEventDetails, TimelineItem } from '../../types/timeline';

function TimelineItemDetails({ item }: { item: TimelineItem }): JSX.Element {
  if (isEventDetails(item)) {
    return <div>{JSON.stringify(item.data.details, null, 2)}</div>;
  }

  return <div />;
}

export default TimelineItemDetails;
