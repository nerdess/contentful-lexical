import type { FeatureFlagKey, FeatureFlags } from '../services/featureFlags';

import { useContentfulFeatureFlags } from './useContentfulFeatureFlags';

/**
 * Hook to get a single feature flag value
 * Includes Contentful parameters with highest priority
 */
export const useFeatureFlag = (flagName: FeatureFlagKey): boolean => {
  return Boolean(useContentfulFeatureFlags()[flagName]);
};

/**
 * Hook to get all feature flags
 * Includes Contentful parameters with highest priority
 */
export const useFeatureFlags = (): FeatureFlags => useContentfulFeatureFlags();
