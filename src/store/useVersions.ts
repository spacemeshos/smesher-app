import { useCallback, useEffect, useMemo, useState } from 'react';
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

const getPrefix = (version: string): string =>
  /([a-zA-Z-+_/]+)/.exec(version)?.[0] ?? '';

const removePrefix = (prefix: string, version: string): string =>
  version.replace(prefix, '');

const checkVersion = async (inputVersion: string): Promise<VersionCheck> => {
  const prefix = getPrefix(inputVersion);
  const version = removePrefix(prefix, inputVersion);

  const versions = await fetchVersionsMap(APP_VERSIONS_MAP_URL);
  const versionsByPrefix = versions
    .filter(([v]) => getPrefix(v) === prefix)
    .map(([s, f]) => [removePrefix(prefix, s), f]);

  const idxBySmesherVersion = versionsByPrefix.findIndex((x, idx) => {
    const isGte = semver.gte(version, x[0] ?? '');
    const next = versionsByPrefix[idx + 1];
    const isUpToNext = next ? semver.lt(version, next[0] ?? '') : true;
    return isGte && isUpToNext;
  });

  const actual: VersionInfo = [inputVersion, currentAppVersion];
  const expected = versions[idxBySmesherVersion];
  if (!expected) {
    throw new Error(
      // eslint-disable-next-line max-len
      `Cannot find the corresponding version for the current Smesher version: ${inputVersion}`
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
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const rpc = getConnection();

  const refresh = useCallback(async () => {
    if (!rpc) return;

    setLoading(true);
    try {
      const version = await fetchSmesherVersion(rpc);
      setSmesherVersion(version);

      const verCheck = await checkVersion(version);
      setError(null);
      setVersionCheck(verCheck);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
      // eslint-disable-next-line no-console
      console.error(err);
    }
    setLoading(false);
  }, [rpc]);

  useEffect(() => {
    // Fetch all required data on start up
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      loading,
      refresh,
      smesherVersion,
      versionCheck,
      currentAppVersion,
      error,
    }),
    [error, refresh, smesherVersion, versionCheck, loading]
  );
};

export default singletonHook(
  {
    refresh: () => Promise.resolve(),
    loading: true,
    error: null,
    smesherVersion: null,
    versionCheck: null,
    currentAppVersion: '',
  },
  useVersions
);
