import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const baseStyle = definePartsStyle({
  tab: {
    fontWeight: 'semibold',
    _selected: {
      color: 'brand.green',
    },
  },
  tablist: {
    borderBottom: '2x solid',
    borderColor: 'inherit',
  },
});

const tabsTheme = defineMultiStyleConfig({ baseStyle });
export default tabsTheme;
