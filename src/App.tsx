import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import { ChakraProvider, ColorModeScript, Flex } from '@chakra-ui/react';

import DashboardScreen from './screens/DashboardScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import Fonts from './theme/Fonts';
import theme from './theme';

function App(): JSX.Element {
  const router = createHashRouter([
    {
      path: '/',
      element: <WelcomeScreen />,
    },
    {
      path: '/dash',
      element: <DashboardScreen />,
    },
  ]);

  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Flex
        flexDirection="column"
        alignItems="center"
        minH="100vh"
        w="100vw"
        p={4}
      >
        <RouterProvider router={router} />
      </Flex>
    </ChakraProvider>
  );
}

export default App;
