import { Link, useNavigate } from 'react-router-dom';

import { Button, Flex, FormLabel, Input, Text } from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { Form, useForm } from 'react-hook-form';

import Logo from '../components/basic/Logo';
import useSmesherConnection from '../store/useSmesherConnection';
import { O } from '@mobily/ts-belt';
import useNetworkInfo from '../store/useNetworkInfo';
import { normalizeURL } from '../utils/url';

function WelcomeScreen(): JSX.Element {
  const { getConnection, setConnection } = useSmesherConnection();
  const NetInfo = useNetworkInfo();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<{
    jsonRPC: string;
  }>();

  const submit = handleSubmit(async (data) => {
    setConnection(data.jsonRPC);
    try {
      await NetInfo.update();
      console.log('Smesher service is connected to', NetInfo.info);
      navigate('/dash');
    } catch (err) {
      console.log('wtf', err);
    }
  });

  return (
    <Flex flexDir="column" alignItems="center" minH="80vh">
      <Logo />

      <Flex
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 24 }}
        py={12}
        textAlign="center"
        flex="1"
      >
        <Text
          fontSize={{ base: '20px', md: '30px' }}
          fontFamily="Univers63"
          color="brand.green"
        >
          THE OFFICIAL
        </Text>
        <Text
          fontSize={{ base: '35px', md: '45px' }}
          fontFamily="Univers93"
          color="brand.green"
          mt={2}
        >
          SMESHER MONITOR APP
        </Text>

        <Form control={control}>
          <FormLabel fontSize="sm">
            URL to Smesher's API
          </FormLabel>
          <Input type="url" {...register('jsonRPC', {
            required: true,
            value: O.getWithDefault(getConnection(), 'http://localhost:9071/'),
            setValueAs: normalizeURL,
          })}>
          </Input>
          <Button
            type="submit"
            width={280}
            size="lg"
            my={10}
            rightIcon={<IconArrowNarrowRight />}
            fontFamily="Univers55"
            fontWeight={400}
            variant="green"
            onClick={submit}
          >
            Connect
          </Button>
        </Form>
      </Flex>
    </Flex>
  );
}

export default WelcomeScreen;
