import { Icon, IconProps } from '@chakra-ui/react';
import { IconCircle, IconCircleFilled } from '@tabler/icons-react';

import { ViewOnlyDynamicStore } from '../../store/utils/createDynamicStore';

export type Props = {
  status: 'unknown' | 'pending' | 'ok' | 'error';
} & IconProps;

const getStatusColor = (status: Props['status']) => {
  switch (status) {
    case 'pending':
      return 'brand.yellow';
    case 'ok':
      return 'brand.green';
    case 'error':
      return 'brand.red';
    case 'unknown':
    default:
      return 'gray.500';
  }
};

export const getStatusByStore = (
  dynStore: Omit<ViewOnlyDynamicStore<unknown>, 'lastUpdate'>
): Props['status'] => {
  if (dynStore.error) return 'error';
  if (dynStore.data === null) return 'pending';
  if (dynStore.data) return 'ok';
  return 'unknown';
};

export default function StatusBulb({ status, ...rest }: Props) {
  const color = getStatusColor(status);
  const icon = status === 'unknown' ? IconCircle : IconCircleFilled;
  return <Icon mb={-0.5} as={icon} color={color} {...rest} />;
}
