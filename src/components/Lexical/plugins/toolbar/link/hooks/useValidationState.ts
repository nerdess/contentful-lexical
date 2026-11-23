import { TFunction } from 'i18next';
import { useCallback, useState } from 'react';

// Use the correct type from react-i18next instead of the generic one
type TranslationFunction = TFunction<'translation', undefined>;

/**
 * Custom hook for managing validation state
 */
export function useValidationState(isUrlValidationEnabled: boolean) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [has403Error, setHas403Error] = useState(false);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);
  const [forceSaveEnabled, setForceSaveEnabled] = useState(false);

  const resetValidationState = useCallback(() => {
    if (isUrlValidationEnabled) {
      setValidationError(null);
      setHas403Error(false);
      setErrorStatusCode(null);
      setForceSaveEnabled(false);
    }
  }, [isUrlValidationEnabled]);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
    setHas403Error(false);
    setErrorStatusCode(null);
    setForceSaveEnabled(false);
  }, []);

  // NOTE: log validation error changes for debugging
  const setValidationErrorWithLog = useCallback((error: string | null) => {
    setValidationError(error);
  }, []);

  const setHas403ErrorWithLog = useCallback((hasError: boolean) => {
    setHas403Error(hasError);
  }, []);

  const shouldShowForceSaveOption = useCallback(() => {
    return errorStatusCode !== null && errorStatusCode >= 400;
  }, [errorStatusCode]);

  const getErrorMessage = useCallback(
    (t: TranslationFunction) => {
      if (errorStatusCode === 404) {
        return t('editor.linkEditor.error404Message');
      } else if (errorStatusCode && errorStatusCode >= 400) {
        return t('editor.linkEditor.errorWithStatusCode', { statusCode: errorStatusCode });
      }
      return validationError;
    },
    [errorStatusCode, validationError]
  );

  // NOTE: return a stable object that doesn't change on every render
  return {
    isValidating,
    validationError,
    has403Error,
    errorStatusCode,
    forceSaveEnabled,
    setIsValidating,
    setValidationError: setValidationErrorWithLog,
    setHas403Error: setHas403ErrorWithLog,
    setErrorStatusCode,
    setForceSaveEnabled,
    resetValidationState,
    clearValidationError,
    shouldShowForceSaveOption,
    getErrorMessage,
  };
}
