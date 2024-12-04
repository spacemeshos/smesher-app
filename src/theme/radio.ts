import { radioAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(radioAnatomy.keys);

const baseStyle = definePartsStyle({
  control: {
    borderRadius: 'full',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'brand.green',
    background: 'brand.lightGray',

    _checked: {
      borderColor: 'brand.green',
      background: 'brand.lightGray',
      color: 'black',

      _focus: {
        borderColor: 'brand.green',
        background: 'brand.lightGray',
        boxShadow: 'none',
      },

      _hover: {
        borderColor: 'brand.green',
        background: 'brand.lightGray',
      },
    },
    _focus: {
      borderColor: 'brand.green',
      background: 'brand.lightGray',
      boxShadow: 'none',
    },
  },
});

const radioTheme = defineMultiStyleConfig({ baseStyle });
export default radioTheme;
