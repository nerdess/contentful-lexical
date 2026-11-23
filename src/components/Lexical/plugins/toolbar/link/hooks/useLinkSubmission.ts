import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LexicalEditor } from 'lexical';
import { useCallback, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';

import { useApiService } from '../../../../../../services/api';
import {
  isMailtoUrl,
  validateUrlFormat,
} from '../../../../../../utils/validateUrlFormat/validateUrlFormat';
import { sanitizeUrl } from '../../../utils/url';

import type { useValidationState } from './useValidationState';

interface UseLinkSubmissionProps {
  editor: LexicalEditor;
  linkUrl: string;
  editedLinkOpenNewWindow: boolean;
  isCreatingLink: React.MutableRefObject<boolean>;
  hadPreviousError: React.MutableRefObject<boolean>;
  setIsLink: Dispatch<boolean>;
  setEditMode: Dispatch<boolean>;
  isUrlValidationEnabled: boolean;
  validationState: ReturnType<typeof useValidationState>;
}

export function useLinkSubmission({
  editor,
  linkUrl,
  editedLinkOpenNewWindow,
  isCreatingLink,
  hadPreviousError,
  setIsLink,
  setEditMode,
  isUrlValidationEnabled,
  validationState,
}: UseLinkSubmissionProps) {
  const { t } = useTranslation();
  const { urlValidator } = useApiService();

  const closeEditor = useCallback(() => {
    setIsLink(false);
    setEditMode(false);
    validationState.resetValidationState();
  }, [setIsLink, setEditMode, validationState]);

  const createAndDispatchLink = useCallback(
    (url: string, openInNewWindow: boolean) => {
      isCreatingLink.current = true;

      const payload = {
        url,
        target: openInNewWindow ? '_blank' : '_self',
        rel: openInNewWindow ? 'noopener noreferrer' : '',
      };

      editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload);

      setTimeout(() => {
        closeEditor();
        isCreatingLink.current = false;
      }, 0);
    },
    [editor, closeEditor]
  );

  const handleSimpleSubmission = useCallback(() => {
    try {
      const sanitized = sanitizeUrl(linkUrl || '');
      createAndDispatchLink(sanitized, editedLinkOpenNewWindow);
    } catch (error) {
      console.error('Error applying link:', error);
      setTimeout(() => {
        closeEditor();
        isCreatingLink.current = false;
      }, 0);
    }
  }, [linkUrl, editedLinkOpenNewWindow, createAndDispatchLink, closeEditor]);

  const handleEnhancedSubmission = useCallback(
    async (forceCreate = false) => {
      const urlToValidate = linkUrl || '';
      const sanitized = sanitizeUrl(urlToValidate);

      validationState.setValidationError(null);
      validationState.setHas403Error(false);
      validationState.setErrorStatusCode(null);

      if (!validateUrlFormat(sanitized)) {
        validationState.setValidationError(t('editor.linkEditor.errorInvalidUrlFormat'));
        validationState.setIsValidating(false);
        return;
      }

      if (isMailtoUrl(sanitized)) {
        createAndDispatchLink(sanitized, editedLinkOpenNewWindow);
        return;
      }

      if (!urlValidator.isConfigured) {
        createAndDispatchLink(sanitized, editedLinkOpenNewWindow);
        return;
      }

      if (forceCreate) {
        createAndDispatchLink(sanitized, editedLinkOpenNewWindow);
        hadPreviousError.current = true;
        validationState.setIsValidating(false);
        return;
      }

      validationState.setIsValidating(true);

      try {
        const validationResponse = await urlValidator.validateUrl(sanitized);

        if (!validationResponse.success) {
          validationState.setValidationError(
            validationResponse.error || t('editor.linkEditor.errorInvalidUrl')
          );
          validationState.setIsValidating(false);
          return;
        }

        if (validationResponse.data?.statusCode && validationResponse.data.statusCode >= 400) {
          validationState.setErrorStatusCode(validationResponse.data.statusCode);

          if (validationResponse.data.statusCode === 403) {
            validationState.setHas403Error(true);
          }

          if (validationResponse.data.statusCode === 404) {
            validationState.setValidationError(t('editor.linkEditor.error404Message'));
          } else {
            validationState.setValidationError(
              t('editor.linkEditor.errorWithStatusCode', {
                statusCode: validationResponse.data.statusCode,
              })
            );
          }

          validationState.setIsValidating(false);
          hadPreviousError.current = true;
          return;
        }

        if (!validationResponse.data?.valid) {
          validationState.setValidationError(t('editor.linkEditor.errorInvalidUrl'));
          validationState.setIsValidating(false);
          return;
        }

        createAndDispatchLink(sanitized, editedLinkOpenNewWindow);
      } catch (error) {
        console.error('Error during link validation or submission:', error);
        validationState.setValidationError(t('editor.linkEditor.errorUnexpected'));
      } finally {
        validationState.setIsValidating(false);
      }
    },
    [
      linkUrl,
      editedLinkOpenNewWindow,
      createAndDispatchLink,
      hadPreviousError,
      urlValidator,
      t,
      validationState,
    ]
  );

  const handleSubmission = useCallback(
    (forceCreate = false) => {
      if (isUrlValidationEnabled) {
        return handleEnhancedSubmission(forceCreate);
      } else {
        return handleSimpleSubmission();
      }
    },
    [isUrlValidationEnabled, handleEnhancedSubmission, handleSimpleSubmission]
  );

  return { handleSubmission };
}
