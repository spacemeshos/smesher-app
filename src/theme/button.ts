import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const green = defineStyle({
  bgGradient: 'linear(87.93deg, #3AFFA7 2.84%, #55E8E2 97.16%)',
  textColor: 'brand.darkGreen',
  borderWidth: '2px',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.green',
    borderWidth: '2px',
    textColor: 'brand.green',
  },
});

const ghostGreen = defineStyle({
  px: 2,
  textColor: 'brand.green',
  fillColor: 'brand.green',
  bgColor: 'transparent',
  _hover: {
    bg: 'whiteAlpha.100',
  },
});

const ghostRed = defineStyle({
  textColor: 'brand.red',
  fillColor: 'brand.red',
  bgColor: 'transparent',
  _hover: {
    bg: 'whiteAlpha.100',
  },
});

const white = defineStyle({
  bg: 'brand.lightAlphaGray',
  borderColor: 'brand.lightAlphaGray',
  borderWidth: '2px',
  textColor: 'brand.darkGreen',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.lightAlphaGray',
    borderWidth: '2px',
    textColor: 'brand.lightAlphaGray',
  },
});

const ghost = defineStyle({
  color: 'brand.lightAlphaGray',
  cursor: 'pointer',
  _hover: {
    bg: 'whiteAlpha.100',
  },
  _disabled: {
    cursor: 'not-allowed',
  },
});

const ghostWhite = defineStyle({
  borderRadius: 'full',
  color: 'brand.lightAlphaGray',
  cursor: 'pointer',
  _hover: {
    color: 'brand.green',
  },
});

const linkWhite = defineStyle({
  textDecoration: 'underline',
  borderRadius: 'full',
  color: 'brand.lightAlphaGray',
  cursor: 'pointer',
  _hover: {
    color: 'brand.green',
    textDecoration: 'none',
  },
});

const whiteModal = defineStyle({
  bg: 'brand.lightAlphaGray',
  borderColor: 'brand.lightAlphaGray',
  borderWidth: '2px',
  textColor: 'brand.modalGreen',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.modalGreen',
    borderColor: 'brand.lightAlphaGray',
    borderWidth: '2px',
    textColor: 'brand.lightAlphaGray',
  },
});

const whiteOutline = defineStyle({
  bg: 'brand.darkGreen',
  borderColor: 'brand.lightGray',
  borderWidth: '2px',
  textColor: 'brand.lightGray',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.green',
    borderWidth: '2px',
    textColor: 'brand.green',
    fillColor: 'brand.green',
  },
});

const danger = defineStyle({
  bg: 'red.600',
  borderColor: 'red.600',
  borderWidth: '2px',
  textColor: 'brand.lightGray',
  borderRadius: 'full',
  _hover: {
    bg: 'red.500',
    borderColor: 'red.500',
    borderWidth: '2px',
    textColor: 'brand.lightGray',
  },
});
const dangerOutline = defineStyle({
  bg: 'brand.darkGreen',
  borderColor: 'brand.lightGray',
  borderWidth: '2px',
  textColor: 'brand.red',
  fillColor: 'brand.red',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.red',
    borderWidth: '2px',
    textColor: 'brand.red',
    fillColor: 'brand.red',
  },
});

const outline = defineStyle({
  bg: 'brand.darkGreen',
  borderColor: 'brand.green',
  borderWidth: '2px',
  textColor: 'brand.green',
  borderRadius: 'full',
  _hover: {
    bg: 'brand.darkGreen',
    borderColor: 'brand.green',
    borderWidth: '2px',
    textColor: 'brand.green',
  },
});

const buttonTheme = defineStyleConfig({
  variants: {
    green,
    ghost,
    ghostWhite,
    ghostGreen,
    ghostRed,
    white,
    linkWhite,
    whiteModal,
    whiteOutline,
    danger,
    dangerOutline,
    outline,
  },
});

export default buttonTheme;
