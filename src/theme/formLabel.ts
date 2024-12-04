import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';

export default defineStyleConfig({
  baseStyle: defineStyle({
    mt: 2,
    mb: 1,
    pl: 4,
    opacity: 1,
    _disabled: {
      opacity: 0.4,
    },
  }),
});
