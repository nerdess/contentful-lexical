export interface FeatureFlags {
  developmentMode: boolean;
  urlValidation: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;

export type ContentfulFeatureFlagKey =
  | 'cfFeatureFlag_developmentMode'
  | 'cfFeatureFlag_urlValidation';

export const featureFlags: FeatureFlags = {
  developmentMode: import.meta.env.DEV,
  urlValidation: true,
};

// NOTE: get all feature flags (non-React context)
export const getFeatureFlags = (): FeatureFlags => {
  if (typeof __FEATURE_FLAGS__ === 'undefined') {
    return featureFlags;
  }

  return { ...featureFlags, ...__FEATURE_FLAGS__ };
};

// NOTE: utility function for non-React contexts
export const isFeatureEnabled = (flagName: FeatureFlagKey): boolean => {
  return Boolean(getFeatureFlags()[flagName]);
};
