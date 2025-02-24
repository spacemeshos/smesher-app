import { useEffect } from 'react';

import {
  Button,
  Icon,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  IconBrandGithub,
  IconExclamationCircleFilled,
  IconThumbUpFilled,
} from '@tabler/icons-react';

import useVersions from '../store/useVersions';

function VersionMismatch(): JSX.Element | null {
  const { loading, error, refresh, smesherVersion, versionCheck } =
    useVersions();
  const disclosure = useDisclosure();

  const { onOpen } = disclosure;
  useEffect(() => {
    if (!versionCheck?.supported) {
      onOpen();
    }
  }, [onOpen, versionCheck?.supported]);

  if (loading) {
    return (
      <Spinner
        title="Checking version..."
        color="brand.yellow"
        size="xs"
        ml={2}
      />
    );
  }

  if (error) {
    return (
      <Button
        variant="link"
        color="brand.red"
        ml={2}
        onClick={refresh}
        lineHeight={0}
      >
        [Cannot check version. Retry?]
      </Button>
    );
  }

  if (!versionCheck || (versionCheck.supported && !versionCheck.hasUpdate)) {
    // All good: Render "Refresh button"
    return (
      <Button
        variant="link"
        color="brand.green"
        ml={2}
        onClick={refresh}
        lineHeight={0}
      >
        [{versionCheck?.actual[0]}]
      </Button>
    );
  }

  const url = `https://smesher-alpha.spacemesh.network/${
    versionCheck.actual[1] ? `version/${versionCheck.actual[1]}/` : ''
  }`;

  return (
    <>
      <Button
        variant="link"
        fontWeight="normal"
        color={versionCheck.hasUpdate ? 'brand.green' : 'brand.yellow'}
        ml={2}
        onClick={disclosure.onOpen}
        lineHeight={0}
      >
        [
        <Icon
          mb={-0.5}
          as={
            versionCheck.hasUpdate
              ? IconThumbUpFilled
              : IconExclamationCircleFilled
          }
          mr={0.5}
        />
        {versionCheck.hasUpdate
          ? 'New Version Available'
          : 'Unsupported Smesher Version'}
        ]
      </Button>
      <Modal
        isCentered
        size="xl"
        isOpen={disclosure.isOpen}
        onClose={disclosure.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {versionCheck.hasUpdate
              ? `Smesher App v${versionCheck.expected[1]} is available`
              : `Smesher Service ${smesherVersion} is not supported`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {versionCheck.hasUpdate ? (
              <Text mb={3}>
                Current Application version: v{versionCheck.actual[1]}
                <br />
                Latest Application version: v{versionCheck.expected[1]}
              </Text>
            ) : (
              <Text mb={3}>
                Current Application version: v{versionCheck.actual[1]}
                <br />
                Required Application version: v{versionCheck.expected[1]}
              </Text>
            )}
            <Text mb={2}>
              Please switch to the Smesher App v{versionCheck.expected[1]} to
              have all the features working correctly by updating your local
              Smesher App or switch to the publicly hosted version.
            </Text>
          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Button
              as={Link}
              href={url}
              target="_blank"
              rel="noreferrer"
              variant="green"
              size="sm"
            >
              To the hosted version
            </Button>
            <Button
              as={Link}
              href="https://github.com/spacemeshos/smesher-app/releases"
              target="_blank"
              rel="noreferrer"
              variant="white"
              size="sm"
            >
              <Icon as={IconBrandGithub} size="sm" mr={1} />
              GitHub
            </Button>
            <Button variant="white" size="sm" onClick={disclosure.onClose}>
              Stay on that version
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default VersionMismatch;
