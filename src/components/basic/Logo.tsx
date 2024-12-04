import { Image } from '@chakra-ui/react';

import logo from '../../assets/logo_white.svg';

export default function Logo() {
  return <Image src={logo} width={200} mt={6} mb={8} />;
}
