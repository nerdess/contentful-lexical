import { describe, expect, it } from 'vitest';

import { featureFlags, getFeatureFlags, isFeatureEnabled } from './featureFlags';

describe('getFeatureFlags', () => {
  it('contains every default flag', () => {
    const flags = getFeatureFlags();

    for (const key of Object.keys(featureFlags)) {
      expect(flags).toHaveProperty(key);
      expect(typeof flags[key as keyof typeof flags]).toBe('boolean');
    }
  });

  it('lets build-time flags override defaults', () => {
    expect(getFeatureFlags()).toEqual({ ...featureFlags, ...__FEATURE_FLAGS__ });
  });
});

describe('isFeatureEnabled', () => {
  it('falls back to the default for flags not defined at build time', () => {
    expect(__FEATURE_FLAGS__).not.toHaveProperty('urlValidation');
    expect(isFeatureEnabled('urlValidation')).toBe(featureFlags.urlValidation);
    expect(isFeatureEnabled('urlValidation')).toBe(true);
  });

  it('uses the build-time value when defined', () => {
    expect(isFeatureEnabled('developmentMode')).toBe(__FEATURE_FLAGS__.developmentMode);
  });
});
