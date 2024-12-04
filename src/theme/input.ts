import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const darkPill = definePartsStyle({
  field: {
    border: '1px solid',
    borderColor: 'brand.lightGray',
    background: 'brand.darkGreen',
    borderRadius: 'full',
    _hover: {
      borderColor: 'brand.green',
    },
    _focus: {
      borderColor: 'brand.green',
      boxShadow: '0 0 0 1px brand.green',
    },
  },
});

const whitePill = definePartsStyle({
  field: {
    border: '1px solid',
    borderColor: 'brand.lightGray',
    bg: 'brand.modalGreen',
    borderRadius: 'full',
    textColor: 'brand.lightGray',
    paddingLeft: 4,
    paddingRight: 4,
    _focus: {
      borderColor: 'brand.lightGray',
    },
  },
});

const inputTheme = defineMultiStyleConfig({
  variants: { darkPill, whitePill },
  defaultProps: {
    variant: 'whitePill',
  },
});

export default inputTheme;
