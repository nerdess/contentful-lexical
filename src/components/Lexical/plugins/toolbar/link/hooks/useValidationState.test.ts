import { act, renderHook } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { useValidationState } from './useValidationState';

const t = vi.fn((key: string, options?: Record<string, unknown>) =>
  options ? `${key}:${JSON.stringify(options)}` : key
) as unknown as TFunction<'translation', undefined>;

const setErrorState = (result: { current: ReturnType<typeof useValidationState> }) => {
  act(() => {
    result.current.setValidationError('error');
    result.current.setHas403Error(true);
    result.current.setErrorStatusCode(403);
    result.current.setForceSaveEnabled(true);
  });
};

describe('useValidationState', () => {
  it('starts without errors', () => {
    const { result } = renderHook(() => useValidationState(true));

    expect(result.current).toMatchObject({
      isValidating: false,
      validationError: null,
      has403Error: false,
      errorStatusCode: null,
      forceSaveEnabled: false,
    });
    expect(result.current.shouldShowForceSaveOption()).toBe(false);
    expect(result.current.getErrorMessage(t)).toBeNull();
  });

  it('offers force save for HTTP errors (status >= 400)', () => {
    const { result } = renderHook(() => useValidationState(true));

    act(() => result.current.setErrorStatusCode(399));
    expect(result.current.shouldShowForceSaveOption()).toBe(false);

    act(() => result.current.setErrorStatusCode(400));
    expect(result.current.shouldShowForceSaveOption()).toBe(true);
  });

  it('shows a dedicated message for 404', () => {
    const { result } = renderHook(() => useValidationState(true));

    act(() => result.current.setErrorStatusCode(404));

    expect(result.current.getErrorMessage(t)).toBe('editor.linkEditor.error404Message');
  });

  it('includes the status code for other HTTP errors', () => {
    const { result } = renderHook(() => useValidationState(true));

    act(() => result.current.setErrorStatusCode(500));

    expect(result.current.getErrorMessage(t)).toBe(
      'editor.linkEditor.errorWithStatusCode:{"statusCode":500}'
    );
  });

  it('shows the validation error when there is no HTTP error', () => {
    const { result } = renderHook(() => useValidationState(true));

    act(() => result.current.setValidationError('Invalid format'));

    expect(result.current.getErrorMessage(t)).toBe('Invalid format');
  });

  it('resets all errors when validation is enabled', () => {
    const { result } = renderHook(() => useValidationState(true));
    setErrorState(result);

    act(() => result.current.resetValidationState());

    expect(result.current).toMatchObject({
      validationError: null,
      has403Error: false,
      errorStatusCode: null,
      forceSaveEnabled: false,
    });
  });

  it('does not reset when validation is disabled', () => {
    const { result } = renderHook(() => useValidationState(false));
    setErrorState(result);

    act(() => result.current.resetValidationState());

    expect(result.current.validationError).toBe('error');
    expect(result.current.errorStatusCode).toBe(403);
  });

  it('always clears errors with clearValidationError', () => {
    const { result } = renderHook(() => useValidationState(false));
    setErrorState(result);

    act(() => result.current.clearValidationError());

    expect(result.current).toMatchObject({
      validationError: null,
      has403Error: false,
      errorStatusCode: null,
      forceSaveEnabled: false,
    });
  });
});
