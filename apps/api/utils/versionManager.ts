// apps/api/utils/versionManager.ts
export interface VersionInfo {
  version: string;
  features: string[];
}

export const versionFeatures: Record<string, string[]> = {
  '1.0.10': [
    'Bug fixes and performance improvements',
    'Enhanced notification system',
    'Improved user interface',
  ],
  '1.0.11': [
    'Fixed push notification issues and improved delivery',
    'Added banner system for important announcements',
    'Enhanced notification feed with better organization',
    'Added pull-to-refresh on home screen',
    'Improved update prompt system',
    'Bug fixes and stability improvements',
  ],
  '1.0.12': [
    'Fixed push notification issues and improved delivery',
    'Updated notification on admin site for better usability',
    'Improved performance',
    'Bug fixes and stability improvements',
  ],
  '1.0.13': [
    'Fixed Bug that didnt allow notifications to disappear',
    'New Update Prompt',
  ],
};

export const defaultFeatures = [
  'Bug fixes and improvements',
  'Enhanced performance',
  'New features',
];

export function getVersionInfo(version: string): VersionInfo {
  const features = versionFeatures[version] || defaultFeatures;

  return {
    version,
    features,
  };
}

export function getAllVersions(): string[] {
  return Object.keys(versionFeatures).sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      if (aPart !== bPart) {
        return bPart - aPart; // Descending order (newest first)
      }
    }
    return 0;
  });
}

export function getLatestVersionInfo(): VersionInfo {
  const latestVersion = process.env.LATEST_APP_VERSION || '1.0.13';
  return getVersionInfo(latestVersion);
}
