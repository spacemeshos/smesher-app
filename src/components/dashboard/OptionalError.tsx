import { Text } from '@chakra-ui/react';

function OptionalError({
  store,
  prefix = '',
}: {
  store: { error: Error | null };
  prefix?: string;
}) {
  if (!store.error) return null;

  return (
    <Text color="red.500">
      {prefix}
      {store.error.message}
    </Text>
  );
}

export default OptionalError;
