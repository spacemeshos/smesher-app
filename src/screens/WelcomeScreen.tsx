import { Form, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Flex,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react';
import { O } from '@mobily/ts-belt';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import Logo from '../components/basic/Logo';
import useSmesherConnection from '../store/useSmesherConnection';
import { normalizeURL } from '../utils/url';

function WelcomeScreen(): JSX.Element {
  const { getLastConnection, setConnection } = useSmesherConnection();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm<{
    jsonRPC: string;
  }>();

  const submit = handleSubmit(async (data) => {
    setConnection(data.jsonRPC);
    try {
      navigate('/dash');
    } catch (err) {
      if (err instanceof Error) {
        setError('jsonRPC', { message: err.message });
      }
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
          <FormLabel fontSize="sm">URL to Smesher&apos;s API</FormLabel>
          <FormErrorMessage>
            {errors.jsonRPC && errors.jsonRPC.message}
          </FormErrorMessage>
          <Input
            type="url"
            {...register('jsonRPC', {
              required: true,
              value: O.getWithDefault(
                getLastConnection(),
                'http://localhost:9071/'
              ),
              setValueAs: normalizeURL,
            })}
          />
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
