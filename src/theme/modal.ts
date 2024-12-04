import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'blackAlpha.600',
  },
  dialogContainer: {
    overflow: 'auto',
    pt: 16,
    pb: [6, 16],
    px: 2,
  },
  dialog: {
    color: 'brand.lightGray',
    paddingX: [2, 6],
    paddingTop: [6, 8],
    paddingBottom: [4, 6],
    borderRadius: '2xl',
    bg: 'brand.modalGreen',
  },
});

const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

export default modalTheme;
