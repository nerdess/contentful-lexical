import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getFeatureFlags } from '../services/featureFlags';

const sdk: { parameters: { instance?: Record<string, unknown> } } = { parameters: {} };

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => sdk,
}));

import { resolveFeatureFlags, useContentfulFeatureFlags } from './useContentfulFeatureFlags';
import { useFeatureFlag, useFeatureFlags } from './useFeatureFlag';

beforeEach(() => {
  sdk.parameters = {};
});

describe('resolveFeatureFlags', () => {
  it('returns the build-time flags without Contentful parameters', () => {
    expect(resolveFeatureFlags()).toEqual(getFeatureFlags());
    expect(resolveFeatureFlags({})).toEqual(getFeatureFlags());
  });

  it('lets Contentful boolean parameters override build-time flags', () => {
    expect(resolveFeatureFlags({ cfFeatureFlag_urlValidation: false }).urlValidation).toBe(false);
    expect(resolveFeatureFlags({ cfFeatureFlag_developmentMode: true }).developmentMode).toBe(true);
  });

  it('accepts string parameters', () => {
    expect(resolveFeatureFlags({ cfFeatureFlag_urlValidation: 'false' }).urlValidation).toBe(false);
    expect(resolveFeatureFlags({ cfFeatureFlag_developmentMode: 'true' }).developmentMode).toBe(
      true
    );
  });

  it('treats any other value as disabled', () => {
    expect(resolveFeatureFlags({ cfFeatureFlag_urlValidation: 'yes' }).urlValidation).toBe(false);
    expect(resolveFeatureFlags({ cfFeatureFlag_urlValidation: null }).urlValidation).toBe(false);
  });

  it('ignores unrelated parameters', () => {
    expect(resolveFeatureFlags({ apiURL: 'https://api.example.com' })).toEqual(getFeatureFlags());
  });
});

describe('useContentfulFeatureFlags', () => {
  it('works when the SDK has no instance parameters', () => {
    const { result } = renderHook(() => useContentfulFeatureFlags());

    expect(result.current).toEqual(getFeatureFlags());
  });

  it('returns the same object while the parameters are unchanged', () => {
    sdk.parameters.instance = { cfFeatureFlag_urlValidation: false };
    const { result, rerender } = renderHook(() => useContentfulFeatureFlags());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

describe('useFeatureFlag', () => {
  it('returns the default when Contentful does not set the flag', () => {
    const { result } = renderHook(() => useFeatureFlag('urlValidation'));

    expect(result.current).toBe(true);
  });

  it('prefers the Contentful parameter', () => {
    sdk.parameters.instance = { cfFeatureFlag_urlValidation: 'false' };
    const { result } = renderHook(() => useFeatureFlag('urlValidation'));

    expect(result.current).toBe(false);
  });
});

describe('useFeatureFlags', () => {
  it('returns all resolved flags', () => {
    sdk.parameters.instance = { cfFeatureFlag_developmentMode: true };
    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current).toEqual({ ...getFeatureFlags(), developmentMode: true });
  });
});
