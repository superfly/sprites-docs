const BINARIES_BASE_URL = 'https://sprites-binaries.t3.storage.dev';

export interface CliBinary {
  platform: string;
  arch: string;
  filename: string;
  url: string;
  checksumUrl: string;
}

export interface CliRelease {
  version: string;
  binaries: CliBinary[];
}

const PLATFORMS = [
  { platform: 'macOS', arch: 'Apple Silicon', key: 'darwin-arm64' },
  { platform: 'macOS', arch: 'Intel', key: 'darwin-amd64' },
  { platform: 'Linux', arch: 'x86-64', key: 'linux-amd64' },
  { platform: 'Linux', arch: 'ARM64', key: 'linux-arm64' },
  { platform: 'Windows', arch: 'x86-64', key: 'windows-amd64' },
  { platform: 'Windows', arch: 'ARM64', key: 'windows-arm64' },
] as const;

function findLatestVersion(xml: string): string {
  const versionPattern = /<Key>client\/(v0\.0\.1-rc(\d+))\//g;
  let maxRcNumber = 0;
  let latestVersion = '';

  for (const match of xml.matchAll(versionPattern)) {
    const rcNumber = parseInt(match[2], 10);
    if (rcNumber > maxRcNumber) {
      maxRcNumber = rcNumber;
      latestVersion = match[1];
    }
  }

  if (!latestVersion) {
    throw new Error('No RC versions found in bucket listing');
  }

  return latestVersion;
}

function buildBinaries(version: string): CliBinary[] {
  return PLATFORMS.map(({ platform, arch, key }) => {
    const ext = key.startsWith('windows') ? 'zip' : 'tar.gz';
    const filename = `sprite-${key}.${ext}`;
    const url = `${BINARIES_BASE_URL}/client/${version}/${filename}`;
    return {
      platform,
      arch,
      filename,
      url,
      checksumUrl: `${url}.sha256`,
    };
  });
}

export async function getLatestRcRelease(): Promise<CliRelease> {
  const response = await fetch(
    `${BINARIES_BASE_URL}/?list-type=2&prefix=client/v0.0.1-rc`,
  );
  const xml = await response.text();
  const version = findLatestVersion(xml);

  return {
    version,
    binaries: buildBinaries(version),
  };
}
