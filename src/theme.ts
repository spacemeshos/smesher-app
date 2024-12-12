import { extendTheme, ThemeConfig } from '@chakra-ui/react';

import buttonTheme from './theme/button';
import cardTheme from './theme/card';
import checkboxTheme from './theme/checkbox';
import drawerTheme from './theme/drawer';
import formLabelTheme from './theme/formLabel';
import inputTheme from './theme/input';
import menuTheme from './theme/menu';
import modalTheme from './theme/modal';
import radioTheme from './theme/radio';
import selectTheme from './theme/select';
import tableTheme from './theme/table';
import tabsTheme from './theme/tabs';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const colors = {
  brand: {
    darkGreen: '#061A14',
    green: '#3AFFA7',
    modalGreen: '#25322F',
    lightGreen: '#F6FFEC',
    lightGray: '#F0F0F0',
    lightAlphaGray: '#F0F0F0EE',
    gray: '#B9B9B9',
    darkGray: '#7D7B7B',
    red: '#F54E4E',
    yellow: '#FFD700',
  },
};

const styles = {
  global: {
    body: {
      bg: 'brand.darkGreen',
    },
  },
};

const components = {
  Menu: menuTheme,
  Button: buttonTheme,
  Card: cardTheme,
  Tabs: tabsTheme,
  Modal: modalTheme,
  Drawer: drawerTheme,
  Checkbox: checkboxTheme,
  Radio: radioTheme,
  Input: inputTheme,
  Select: selectTheme,
  FormLabel: formLabelTheme,
  Table: tableTheme,
};
const theme = extendTheme({ config, colors, components, styles });

export default theme;
