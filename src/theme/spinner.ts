import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const xxl = defineStyle({
  height: 200,
  width: 200,
  borderWidth: 8,
});

const spinnerTheme = defineStyleConfig({
  sizes: { xxl },
});

export default spinnerTheme;
