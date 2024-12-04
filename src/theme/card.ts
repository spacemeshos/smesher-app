import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    backgroundColor: 'brand.darkGreen',
    shadow: 'none',
  },
});

const list = definePartsStyle({
  container: {
    backgroundColor: 'brand.darkGreen',
    shadow: 'none',
    borderRadius: '0px',
  },
  body: {
    py: 2,
  },
});

const cardTheme = defineMultiStyleConfig({ baseStyle, variants: { list } });
export default cardTheme;
