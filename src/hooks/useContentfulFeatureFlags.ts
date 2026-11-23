import { useSDK } from '@contentful/react-apps-toolkit';
import { useMemo } from 'react';

import type {
  FeatureFlags,
  FeatureFlagKey,
  ContentfulFeatureFlagKey,
} from '../services/featureFlags';
import { getFeatureFlags } from '../services/featureFlags';

// NOTE: mapping between local flag names and Contentful parameter names
const contentfulFlagMapping: Record<FeatureFlagKey, ContentfulFeatureFlagKey> = {
  developmentMode: 'cfFeatureFlag_developmentMode',
  urlValidation: 'cfFeatureFlag_urlValidation',
};

export const resolveFeatureFlags = (
  contentfulParameters: Record<string, unknown> = {}
): FeatureFlags => {
  const buildTimeFlags = getFeatureFlags();

  return (Object.keys(buildTimeFlags) as FeatureFlagKey[]).reduce((flags, key) => {
    const contentfulValue = contentfulParameters[contentfulFlagMapping[key]];

    flags[key] =
      contentfulValue === undefined
        ? buildTimeFlags[key]
        : contentfulValue === true || contentfulValue === 'true';

    return flags;
  }, {} as FeatureFlags);
};

/**
 * Hook to get feature flags from multiple sources with priority:
 * 1. Contentful app parameters (highest priority)
 * 2. Build-time Vite flags
 * 3. Default configuration (lowest priority)
 */
export const useContentfulFeatureFlags = (): FeatureFlags => {
  const sdk = useSDK();
  const contentfulParameters = sdk?.parameters?.instance as Record<string, unknown> | undefined;

  return useMemo(() => resolveFeatureFlags(contentfulParameters), [contentfulParameters]);
};
