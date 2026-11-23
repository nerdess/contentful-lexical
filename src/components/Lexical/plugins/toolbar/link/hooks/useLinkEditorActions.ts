import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $findMatchingParent } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $createTextNode,
  LexicalEditor,
} from 'lexical';
import { useCallback, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';

import { useApiService } from '../../../../../../services/api';
import {
  isMailtoUrl,
  validateUrlFormat,
} from '../../../../../../utils/validateUrlFormat/validateUrlFormat';
import { getSelectedNode } from '../../../utils/getSelectedNode';
import { sanitizeUrl } from '../../../utils/url';

import type { useValidationState } from './useValidationState';

interface UseLinkEditorActionsProps {
  editor: LexicalEditor;
  setIsLink: Dispatch<boolean>;
  setEditMode: Dispatch<boolean>;
  isCreatingLink: React.MutableRefObject<boolean>;
  hadPreviousError: React.MutableRefObject<boolean>;
  userEditedText: React.MutableRefObject<boolean>;
  isUrlValidationEnabled: boolean;
  validationState: ReturnType<typeof useValidationState>;
}

export function useLinkEditorActions({
  editor,
  setIsLink,
  setEditMode,
  isCreatingLink,
  hadPreviousError,
  userEditedText,
  isUrlValidationEnabled,
  validationState,
}: UseLinkEditorActionsProps) {
  const { t } = useTranslation();
  const { urlValidator } = useApiService();

  const closeEditor = useCallback(() => {
    setIsLink(false);
    setEditMode(false);
    validationState.resetValidationState();
    userEditedText.current = false;
  }, [setIsLink, setEditMode, validationState, userEditedText]);

  const createLinkWithText = useCallback(
    (url: string, text: string, openInNewWindow: boolean) => {
      try {
        isCreatingLink.current = true;

        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const focusNode = getSelectedNode(selection);
            const existingLinkNode = $isLinkNode(focusNode)
              ? focusNode
              : $findMatchingParent(focusNode, $isLinkNode);

            if (existingLinkNode) {
              existingLinkNode.setURL(url);
              existingLinkNode.setTarget(openInNewWindow ? '_blank' : '_self');
              existingLinkNode.setRel(openInNewWindow ? 'noopener noreferrer' : '');

              const currentText = existingLinkNode.getTextContent();
              if (currentText !== text) {
                const textNode = existingLinkNode.getFirstChild();
                if ($isTextNode(textNode)) {
                  textNode.setTextContent(text);
                } else {
                  existingLinkNode.clear();
                  existingLinkNode.append($createTextNode(text));
                }
              }
            } else {
              selection.insertText(text);

              const newSelection = $getSelection();
              if ($isRangeSelection(newSelection)) {
                const anchor = newSelection.anchor;
                const focus = newSelection.focus;
                const textLength = text.length;

                newSelection.anchor.set(
                  anchor.key,
                  Math.max(0, anchor.offset - textLength),
                  'text'
                );
                newSelection.focus.set(focus.key, focus.offset, 'text');

                const payload = {
                  url: url,
                  target: openInNewWindow ? '_blank' : '_self',
                  rel: openInNewWindow ? 'noopener noreferrer' : '',
                };

                editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload);
              }
            }
          }
        });

        setTimeout(() => {
          closeEditor();
          isCreatingLink.current = false;
        }, 0);
      } catch (error) {
        console.error('Error applying link:', error);
        setTimeout(() => {
          closeEditor();
          isCreatingLink.current = false;
        }, 0);
      }
    },
    [editor, closeEditor, isCreatingLink]
  );

  const handleSubmissionWithText = useCallback(
    async (linkUrl: string, linkText: string, openInNewWindow: boolean, forceCreate = false) => {
      const urlToValidate = linkUrl || '';

      if (!urlToValidate.trim()) {
        validationState.setValidationError(t('editor.linkEditor.errorEmptyUrl'));
        return;
      }

      const textToUse = linkText.trim() || urlToValidate.trim();

      if (!textToUse) {
        validationState.setValidationError(t('editor.linkEditor.errorEmptyText'));
        return;
      }

      validationState.setValidationError(null);
      validationState.setHas403Error(false);
      validationState.setErrorStatusCode(null);

      const sanitized = sanitizeUrl(urlToValidate);

      // NOTE: handle mailto: links first, before any validation logic
      if (isMailtoUrl(sanitized)) {
        createLinkWithText(sanitized, textToUse, openInNewWindow);
        return;
      }

      if (isUrlValidationEnabled) {
        if (!validateUrlFormat(sanitized)) {
          validationState.setValidationError(t('editor.linkEditor.errorInvalidUrlFormat'));
          validationState.setIsValidating(false);
          return;
        }

        if (!urlValidator.isConfigured) {
          createLinkWithText(sanitized, textToUse, openInNewWindow);
          return;
        }

        validationState.setIsValidating(true);

        if (forceCreate) {
          createLinkWithText(sanitized, textToUse, openInNewWindow);
          hadPreviousError.current = true;
          validationState.setIsValidating(false);
          return;
        }

        try {
          const validationResponse = await urlValidator.validateUrl(sanitized);

          if (!validationResponse.success) {
            validationState.setValidationError(
              validationResponse.error || t('editor.linkEditor.errorInvalidUrl') || 'Invalid URL'
            );
            validationState.setIsValidating(false);
            return;
          }

          if (validationResponse.data?.statusCode && validationResponse.data.statusCode >= 400) {
            validationState.setHas403Error(true);
            validationState.setErrorStatusCode(validationResponse.data.statusCode);

            if (validationResponse.data.statusCode === 404) {
              validationState.setValidationError(
                t('editor.linkEditor.error404Message') ||
                  'This URL returns a 404 error (page not found). You can force save if needed.'
              );
            } else if (validationResponse.data.statusCode === 403) {
              validationState.setValidationError(
                t('editor.linkEditor.error403Message') ||
                  'This URL returns a 403 error (access denied). You can force save if needed.'
              );
            } else if (
              validationResponse.data.statusCode >= 400 &&
              validationResponse.data.statusCode < 500
            ) {
              validationState.setValidationError(
                t('editor.linkEditor.errorWithStatusCode', {
                  statusCode: validationResponse.data.statusCode,
                }) ||
                  `URL returned error ${validationResponse.data.statusCode}. You can force save if needed.`
              );
            } else {
              validationState.setValidationError(
                t('editor.linkEditor.errorInvalidUrl') || 'Invalid URL'
              );
            }

            validationState.setIsValidating(false);
            hadPreviousError.current = true;
            return;
          }

          if (!validationResponse.data?.valid) {
            validationState.setValidationError(
              t('editor.linkEditor.errorInvalidUrl') || 'Invalid URL'
            );
            validationState.setIsValidating(false);
            return;
          }

          createLinkWithText(sanitized, textToUse, openInNewWindow);
        } catch (error) {
          console.error('Error during link validation or submission:', error);
          validationState.setValidationError(
            t('editor.linkEditor.errorUnexpected') || 'An unexpected error occurred'
          );
        } finally {
          validationState.setIsValidating(false);
        }
      } else {
        createLinkWithText(sanitized, textToUse, openInNewWindow);
      }
    },
    [isUrlValidationEnabled, validationState, urlValidator, t, hadPreviousError, createLinkWithText]
  );

  const deleteLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    closeEditor();
  }, [editor, closeEditor]);

  return {
    closeEditor,
    createLinkWithText,
    handleSubmissionWithText,
    deleteLink,
  };
}
