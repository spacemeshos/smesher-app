import { useEffect, useMemo, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import semver from 'semver';

import { version as currentAppVersion } from '../../package.json';
import { fetchSmesherVersion, fetchVersionsMap } from '../api/requests/version';

import useSmesherConnection from './useSmesherConnection';

const APP_VERSIONS_MAP_URL =
  'https://configs.spacemesh.network/smesher-app.versions.json';

type VersionInfo = [
  // Version of Smesher Service fetched via API
  string,
  // Supported version of the app [minimal] or [minimal, maximal]
  string
];

export interface VersionCheck {
  supported: boolean;
  hasUpdate: boolean;
  actual: VersionInfo;
  expected: VersionInfo;
}

const checkVersion = async (version: string): Promise<VersionCheck> => {
  const versions = await fetchVersionsMap(APP_VERSIONS_MAP_URL);

  const idxBySmesherVersion = versions.findIndex((x, idx) => {
    const isGte = semver.gte(version, x[0] ?? '');
    const next = versions[idx + 1];
    const isUpToNext = next ? semver.lt(version, next[0] ?? '') : true;
    return isGte && isUpToNext;
  });

  const actual: VersionInfo = [version, currentAppVersion];
  const expected = versions[idxBySmesherVersion];
  if (!expected) {
    throw new Error(
      // eslint-disable-next-line max-len
      `Cannot find the corresponding version for the current Smesher version: ${version}`
    );
  }

  const prevFrontEndVersion = versions[idxBySmesherVersion - 1]?.[1];
  const hasUpdate =
    semver.lt(currentAppVersion, expected[1]) &&
    (prevFrontEndVersion
      ? semver.gt(currentAppVersion, prevFrontEndVersion)
      : true);
  const supported = prevFrontEndVersion
    ? semver.satisfies(
        currentAppVersion,
        `>${prevFrontEndVersion} <=${expected[1]}`
      )
    : semver.satisfies(currentAppVersion, `<=${expected[1]}`);

  return {
    supported,
    hasUpdate,
    actual,
    expected,
  };
};

export const getHostedAppUrl = (hostedVersion: string): string =>
  `https://smesher-alpha.spacemesh.network/${hostedVersion}/#/dash`;

const useVersions = () => {
  const { getConnection } = useSmesherConnection();
  const [smesherVersion, setSmesherVersion] = useState<string | null>(null);
  const [versionCheck, setVersionCheck] = useState<VersionCheck | null>(null);
  const rpc = getConnection();

  useEffect(() => {
    if (rpc) {
      fetchSmesherVersion(rpc).then((version) => {
        setSmesherVersion(version);
      });
    }
  }, [rpc, setSmesherVersion]);

  useEffect(() => {
    if (!smesherVersion) return;

    checkVersion(smesherVersion)
      .then((version) => {
        setVersionCheck(version);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }, [smesherVersion]);

  return useMemo(
    () => ({
      smesherVersion,
      versionCheck,
      currentAppVersion,
    }),
    [smesherVersion, versionCheck]
  );
};

export default singletonHook(
  { smesherVersion: null, versionCheck: null, currentAppVersion: '' },
  useVersions
);
