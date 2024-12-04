import { selectAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);

const whitePill = definePartsStyle({
  field: {
    textColor: 'brand.lightGray',
    border: '1px solid',
    borderColor: 'brand.lightGray',
    bg: 'brand.modalGreen',
    borderRadius: 'full',
    paddingLeft: 4,
    paddingRight: 4,
    _focus: {
      borderColor: 'brand.lightGray',
    },
  },
});

const selectTheme = defineMultiStyleConfig({
  variants: { whitePill },
  defaultProps: {
    variant: 'whitePill',
  },
});

export default selectTheme;
