import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  button: {
    fontWeight: 'medium',
    bg: 'teal.500',
    color: 'gray.200',
    _hover: {
      bg: 'alpha.50',
      color: 'white',
    },
  },
  list: {
    py: 0,
    borderRadius: 'xl',
    border: 'none',
    bg: 'brand.lightGray',
    overflow: 'auto',
    maxH: '65vh',
  },
  item: {
    py: 2,
    color: 'brand.darkGreen',
    bg: 'brand.lightGray',
    _focus: {
      bg: 'blackAlpha.200',
    },
    _first: {
      pt: 2.5,
    },
    _last: {
      pb: 2.5,
    },
  },
  groupTitle: {
    textTransform: 'uppercase',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 'wider',
    opacity: '0.7',
  },
  command: {
    opacity: '0.8',
    fontFamily: 'mono',
    fontSize: 'sm',
    letterSpacing: 'tighter',
    pl: 4,
  },
  divider: {
    my: 2,
    mx: 0,
    color: 'brand.gray',
    borderBottom: '1px ',
  },
});

const menuTheme = defineMultiStyleConfig({ baseStyle });

export default menuTheme;
