/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  TextInput,
  Checkbox,
  Button,
  Box,
  ButtonGroup,
  Stack,
  ValidationMessage,
  FormControl,
  Text,
} from '@contentful/f36-components';
import { TrashSimpleIcon, XIcon, CheckIcon, LinkSimpleIcon, InfoIcon } from '@contentful/f36-icons';
import { FloatingArrow } from '@floating-ui/react';
import {
  $isAutoLinkNode,
  $isLinkNode,
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  LexicalCommand,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  createCommand,
  $isLineBreakNode,
} from 'lexical';
import React, { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useFeatureFlag } from '../../../../../hooks/useFeatureFlag';
import { isFeatureEnabled } from '../../../../../services/featureFlags';
import { getSelectedNode } from '../../utils/getSelectedNode';

import { useFloatingLinkPosition } from './hooks/useFloatingLinkPosition';
import { useLinkEditorActions } from './hooks/useLinkEditorActions';
import { useSelectionRect } from './hooks/useSelectionRect';
import { useValidationState } from './hooks/useValidationState';

import './floatingLinkEditorPlugin.css';
import tokens from '@contentful/f36-tokens';

export const FORCE_UPDATE_LINK_EDITOR_COMMAND: LexicalCommand<null> = createCommand();
export const SHOW_LINK_EDITOR_COMMAND: LexicalCommand<null> = createCommand();
export const LINK_EDITOR_VISIBILITY_COMMAND: LexicalCommand<boolean> = createCommand();

interface FloatingLinkEditorProps {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  isEditMode: boolean;
  setEditMode: Dispatch<boolean>;
  initialLinkUrl: string;
  initialLinkTarget: boolean;
  initialLinkText: string;
  isCreatingLink: React.MutableRefObject<boolean>;
  hadPreviousError: React.MutableRefObject<boolean>;
  // NOTE: add a unique key to force re-initialization
  linkEditingSessionId: string;
}

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  isEditMode,
  setEditMode,
  initialLinkUrl,
  initialLinkTarget,
  initialLinkText,
  isCreatingLink,
  hadPreviousError,
  linkEditingSessionId,
}: FloatingLinkEditorProps): JSX.Element {
  const { t } = useTranslation();
  const isUrlValidationEnabled = useFeatureFlag('urlValidation');

  const urlInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [editedLinkOpenNewWindow, setEditedLinkOpenNewWindow] = useState(false);

  // NOTE: track the last session ID to detect when we're editing a different link
  const lastSessionId = useRef<string>('');
  // NOTE: track if user has manually edited the link text
  const userEditedText = useRef(false);

  const { selectionRect, updateSelectionRect } = useSelectionRect(editor);
  const validationState = useValidationState(isUrlValidationEnabled);

  // Use the new actions hook
  const { closeEditor, handleSubmissionWithText, deleteLink } = useLinkEditorActions({
    editor,
    setIsLink,
    setEditMode,
    isCreatingLink,
    hadPreviousError,
    userEditedText,
    isUrlValidationEnabled,
    validationState,
  });

  const floatingPosition = useFloatingLinkPosition({
    isOpen: isEditMode && isLink,
    selectionRect,
    validationError: validationState.validationError,
    forceSaveEnabled: validationState.forceSaveEnabled,
    onOpenChange: open => {
      if (!open) {
        closeEditor();
      }
    },
  });

  const monitorInputInteraction = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmissionWithText(
          linkUrl,
          linkText,
          editedLinkOpenNewWindow,
          validationState.forceSaveEnabled
        );
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeEditor();
      }
    },
    [
      handleSubmissionWithText,
      linkUrl,
      linkText,
      editedLinkOpenNewWindow,
      validationState.forceSaveEnabled,
      closeEditor,
    ]
  );

  const handleUrlInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setLinkUrl(newValue);

      if (validationState.validationError) {
        validationState.resetValidationState();
      }

      // NOTE: only auto-fill link text if:
      // 1. User hasn't manually edited the text field
      // 2. Link text is currently empty (not just matching URL)
      // 3. We have a new URL value
      if (!userEditedText.current && !linkText.trim() && newValue.trim()) {
        setLinkText(newValue);
      }
    },
    [linkText, validationState]
  );

  const handleTextInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setLinkText(newValue);
    userEditedText.current = true;
  }, []);

  const effectiveLinkText = linkText.trim() || linkUrl.trim();

  // NOTE: initialize state when editing a new link (detected by session ID change)
  useEffect(() => {
    if (isLink && isEditMode && linkEditingSessionId !== lastSessionId.current) {
      setLinkUrl(initialLinkUrl);
      setLinkText(initialLinkText);
      setEditedLinkOpenNewWindow(initialLinkTarget);
      validationState.resetValidationState();
      userEditedText.current = false;
      lastSessionId.current = linkEditingSessionId;
    }
  }, [
    isLink,
    isEditMode,
    linkEditingSessionId,
    initialLinkUrl,
    initialLinkText,
    initialLinkTarget,
    validationState,
  ]);

  useEffect(
    function updateSelectionRectWhenEditorOpens() {
      if (isEditMode && isLink) {
        editor.getEditorState().read(() => {
          updateSelectionRect();
        });
      }
    },
    [isEditMode, isLink, editor, updateSelectionRect]
  );

  useEffect(
    function registerEditorCommands() {
      return mergeRegister(
        editor.registerCommand(
          FORCE_UPDATE_LINK_EDITOR_COMMAND,
          () => {
            if (isEditMode && isLink) {
              editor.getEditorState().read(() => {
                updateSelectionRect();
              });
            }
            return true;
          },
          COMMAND_PRIORITY_LOW
        ),
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          () => {
            if (isEditMode && isLink) {
              editor.getEditorState().read(() => {
                updateSelectionRect();
              });
            }
            return true;
          },
          COMMAND_PRIORITY_LOW
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          () => {
            if (isLink) {
              closeEditor();
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH
        )
      );
    },
    [editor, isEditMode, isLink, updateSelectionRect, closeEditor]
  );

  useEffect(
    function focusInputWhenEditorOpens() {
      if (isEditMode && urlInputRef.current) {
        urlInputRef.current.focus({ preventScroll: true });
      }
    },
    [isEditMode]
  );

  useEffect(
    function cleanupValidationStatesWhenEditorCloses() {
      if (!isLink || !isEditMode) {
        validationState.resetValidationState();
      }
    },
    [isLink, isEditMode, validationState]
  );

  const showForceSaveOption = validationState.shouldShowForceSaveOption();

  const displayErrorMessage = validationState.validationError
    ? validationState.getErrorMessage(t)
    : null;

  if (!isEditMode || !selectionRect) {
    return <div />;
  }

  return (
    <div
      ref={floatingPosition.refs.setFloating}
      style={{
        ...floatingPosition.floatingStyles,
        zIndex: 10000,
        position: 'fixed',
        visibility: floatingPosition.isPositioned ? 'visible' : 'hidden',
      }}
      className='link-editor'
      {...floatingPosition.getFloatingProps()}
    >
      <FloatingArrow
        ref={floatingPosition.arrowRef}
        context={floatingPosition.context}
        className='link-editor-arrow'
      />

      {isUrlValidationEnabled ? (
        <Stack flexDirection='column' alignItems='start' spacing='spacingXs' fullWidth>
          <Box style={{ width: '100%' }}>
            <TextInput
              id='text-input'
              ref={textInputRef}
              value={linkText}
              className='link-input'
              placeholder={t('editor.linkEditor.textPlaceholder')}
              aria-label={t('editor.linkEditor.linkTextLabel')}
              onChange={handleTextInputChange}
              onKeyDown={monitorInputInteraction}
            />
          </Box>

          <Stack flexDirection='row' alignItems='center' spacing='spacingS' fullWidth>
            <Box style={{ flex: 1 }}>
              <FormControl
                marginBottom='none'
                isInvalid={!!validationState.validationError}
                id='link-editor-form-control'
              >
                <TextInput
                  id='url-input'
                  ref={urlInputRef}
                  value={linkUrl}
                  className='link-input'
                  placeholder={t('editor.linkEditor.urlPlaceholder')}
                  aria-label={t('editor.linkEditor.linkInputLabel')}
                  aria-describedby={validationState.validationError ? 'link-url-error' : undefined}
                  isInvalid={!!validationState.validationError && !validationState.forceSaveEnabled}
                  onChange={handleUrlInputChange}
                  onKeyDown={monitorInputInteraction}
                />
              </FormControl>
            </Box>
            <Box style={{ flexShrink: 0 }}>
              <Checkbox
                id='link-open-new-window'
                isChecked={editedLinkOpenNewWindow}
                onChange={() => setEditedLinkOpenNewWindow(prev => !prev)}
              >
                {t('editor.linkEditor.openInNewTab')}
              </Checkbox>
            </Box>
          </Stack>

          {linkUrl && !linkText.trim() && (
            <Stack spacing='spacingXs' alignItems='center' paddingLeft='spacing2Xs'>
              <InfoIcon color={tokens.colorWarning} />
              <Text fontColor='gray700' fontSize='fontSizeS'>
                {t('editor.linkEditor.willUseUrlAsText')}
              </Text>
            </Stack>
          )}

          {validationState.validationError && (
            <Box style={{ marginBottom: 0 }}>
              <ValidationMessage id='link-url-error'>{displayErrorMessage}</ValidationMessage>
            </Box>
          )}

          {showForceSaveOption && (
            <Box marginTop='spacingXs'>
              <Checkbox
                id='force-save-link'
                isChecked={validationState.forceSaveEnabled}
                onChange={() => validationState.setForceSaveEnabled(prev => !prev)}
              >
                {t('editor.linkEditor.forceSaveOption')}
              </Checkbox>
            </Box>
          )}

          <Stack justifyContent='space-between' fullWidth>
            <Box>
              <ButtonGroup>
                <Button
                  aria-label={t('editor.linkEditor.cancel')}
                  size='small'
                  variant='secondary'
                  isDisabled={validationState.isValidating}
                  endIcon={<XIcon />}
                  tabIndex={0}
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={closeEditor}
                >
                  {t('editor.linkEditor.cancel')}
                </Button>
                <Button
                  aria-label={t('editor.linkEditor.deleteLink')}
                  size='small'
                  variant='secondary'
                  isDisabled={validationState.isValidating}
                  endIcon={<TrashSimpleIcon />}
                  tabIndex={0}
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={deleteLink}
                >
                  {t('editor.linkEditor.deleteLink')}
                </Button>
              </ButtonGroup>
            </Box>
            <Box>
              {showForceSaveOption ? (
                <Button
                  aria-label={
                    validationState.forceSaveEnabled
                      ? t('editor.linkEditor.forceSave')
                      : t('editor.linkEditor.save')
                  }
                  size='small'
                  variant={validationState.forceSaveEnabled ? 'negative' : 'primary'}
                  endIcon={validationState.forceSaveEnabled ? <LinkSimpleIcon /> : <CheckIcon />}
                  tabIndex={0}
                  isLoading={validationState.isValidating}
                  isDisabled={
                    validationState.isValidating ||
                    (!validationState.forceSaveEnabled && showForceSaveOption) ||
                    !effectiveLinkText
                  }
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={() =>
                    handleSubmissionWithText(
                      linkUrl,
                      linkText,
                      editedLinkOpenNewWindow,
                      validationState.forceSaveEnabled
                    )
                  }
                >
                  {validationState.isValidating
                    ? t('editor.linkEditor.validating')
                    : validationState.forceSaveEnabled
                      ? t('editor.linkEditor.forceSave')
                      : t('editor.linkEditor.save')}
                </Button>
              ) : (
                <Button
                  aria-label={t('editor.linkEditor.save')}
                  size='small'
                  variant='primary'
                  endIcon={<CheckIcon />}
                  tabIndex={0}
                  isLoading={validationState.isValidating}
                  isDisabled={validationState.isValidating || !effectiveLinkText}
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={() =>
                    handleSubmissionWithText(linkUrl, linkText, editedLinkOpenNewWindow, false)
                  }
                >
                  {validationState.isValidating
                    ? t('editor.linkEditor.validating')
                    : t('editor.linkEditor.save')}
                </Button>
              )}
            </Box>
          </Stack>
        </Stack>
      ) : (
        <Stack flexDirection='column' alignItems='start' spacing='spacingXs' fullWidth>
          <Box style={{ width: '100%' }}>
            <TextInput
              id='text-input-simple'
              ref={textInputRef}
              value={linkText}
              className='link-input'
              placeholder={t('editor.linkEditor.textPlaceholder')}
              aria-label={t('editor.linkEditor.linkTextLabel')}
              onChange={handleTextInputChange}
              onKeyDown={monitorInputInteraction}
            />
          </Box>

          <Stack flexDirection='row' alignItems='center' spacing='spacingS' fullWidth>
            <Box style={{ flex: 1 }}>
              <TextInput
                id='url-input-simple'
                ref={urlInputRef}
                value={linkUrl}
                className='link-input'
                placeholder={t('editor.linkEditor.urlPlaceholder')}
                aria-label={t('editor.linkEditor.linkInputLabel')}
                onChange={handleUrlInputChange}
                onKeyDown={monitorInputInteraction}
              />
            </Box>
            <Box style={{ flexShrink: 0 }}>
              <Checkbox
                id='link-open-new-window-simple'
                isChecked={editedLinkOpenNewWindow}
                onChange={() => setEditedLinkOpenNewWindow(prev => !prev)}
              >
                {t('editor.linkEditor.openInNewTab')}
              </Checkbox>
            </Box>
          </Stack>

          {linkUrl && !linkText.trim() && (
            <Stack spacing='spacingXs' alignItems='center' paddingLeft='spacing2Xs'>
              <InfoIcon color={tokens.colorWarning} />
              <Text fontColor='gray700' fontSize='fontSizeS'>
                {t('editor.linkEditor.willUseUrlAsText')}
              </Text>
            </Stack>
          )}

          <Stack justifyContent='space-between' fullWidth>
            <Box>
              <ButtonGroup>
                <Button
                  aria-label={t('editor.linkEditor.cancel')}
                  size='small'
                  variant='secondary'
                  endIcon={<XIcon />}
                  tabIndex={0}
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={closeEditor}
                >
                  {t('editor.linkEditor.cancel')}
                </Button>
                <Button
                  aria-label={t('editor.linkEditor.deleteLink')}
                  size='small'
                  variant='secondary'
                  endIcon={<TrashSimpleIcon />}
                  tabIndex={0}
                  onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                  onClick={deleteLink}
                >
                  {t('editor.linkEditor.deleteLink')}
                </Button>
              </ButtonGroup>
            </Box>
            <Box>
              <Button
                aria-label={t('editor.linkEditor.save')}
                size='small'
                variant='primary'
                endIcon={<CheckIcon />}
                tabIndex={0}
                isDisabled={!effectiveLinkText}
                onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
                onClick={() =>
                  handleSubmissionWithText(linkUrl, linkText, editedLinkOpenNewWindow, false)
                }
              >
                {t('editor.linkEditor.save')}
              </Button>
            </Box>
          </Stack>
        </Stack>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(editor: LexicalEditor): React.ReactPortal {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [initialLinkUrl, setInitialLinkUrl] = useState('');
  const [initialLinkTarget, setInitialLinkTarget] = useState(false);
  const [initialLinkText, setInitialLinkText] = useState('');
  const [linkEditingSessionId, setLinkEditingSessionId] = useState('');
  const isCreatingLink = useRef(false);
  const hadPreviousError = useRef(false);
  const lastLinkNode = useRef<LinkNode | AutoLinkNode | null>(null);

  const isUrlValidationEnabled = useFeatureFlag('urlValidation');

  // NOTE: helper function to extract link text from selection or node
  const extractLinkText = useCallback((linkNode?: LinkNode | AutoLinkNode) => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const selectedText = selection.getTextContent();
      if (selectedText.trim()) {
        return selectedText;
      }
    }

    if (linkNode) {
      return linkNode.getTextContent() || '';
    }

    return '';
  }, []);

  useEffect(
    function dispatchVisibilityCommandOnEditModeChange() {
      editor.dispatchCommand(LINK_EDITOR_VISIBILITY_COMMAND, isEditMode);
    },
    [isEditMode, editor]
  );

  useEffect(
    function registerToolbarCommands() {
      const updateToolbar = () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const focusNode = getSelectedNode(selection);

          const focusLinkNode = $isLinkNode(focusNode)
            ? focusNode
            : $findMatchingParent(focusNode, $isLinkNode);

          const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode);

          if (!(focusLinkNode || focusAutoLinkNode)) {
            if (lastLinkNode.current) {
              setIsLink(false);
              setEditMode(false);
              lastLinkNode.current = null;
            }
            return;
          }

          const isCollapsedSelection = selection.anchor.offset === selection.focus.offset;

          if (!isCollapsedSelection && (focusLinkNode || focusAutoLinkNode)) {
            setIsLink(false);
            setEditMode(false);
            lastLinkNode.current = null;
            return;
          }

          if (isCollapsedSelection && focusLinkNode) {
            const selectionOffset = selection.anchor.offset;
            const focusNodeTextContent = focusNode.getTextContent();

            let isAtLinkBoundary = false;

            if ($isLinkNode(focusNode)) {
              isAtLinkBoundary =
                selectionOffset === 0 || selectionOffset === focusNodeTextContent.length;
            } else {
              const parentTextLength = focusNodeTextContent.length;
              isAtLinkBoundary = selectionOffset === 0 || selectionOffset === parentTextLength;
            }

            if (isAtLinkBoundary) {
              setIsLink(false);
              setEditMode(false);
              lastLinkNode.current = null;
              return;
            }
          }

          const exactSelectedNodes = selection.getNodes();
          const hasMultipleLinks = exactSelectedNodes
            .filter(node => !$isLineBreakNode(node))
            .some(node => {
              const linkNode = $isLinkNode(node) ? node : $findMatchingParent(node, $isLinkNode);
              return focusLinkNode && linkNode && !focusLinkNode.is(linkNode);
            });

          if (!hasMultipleLinks) {
            let newSessionId = '';

            if (focusLinkNode) {
              const newUrl = focusLinkNode.getURL();
              const newTarget = focusLinkNode.getTarget() === '_blank';
              const newText = extractLinkText(focusLinkNode);

              // NOTE: create a unique session ID based on the link node key and content
              newSessionId = `${focusLinkNode.getKey()}-${newUrl}-${newText}`;

              setInitialLinkUrl(newUrl);
              setInitialLinkTarget(newTarget);
              setInitialLinkText(newText);
              setLinkEditingSessionId(newSessionId);
              lastLinkNode.current = focusLinkNode;
            } else if (focusAutoLinkNode) {
              const newUrl = focusAutoLinkNode.getURL();
              const newText = extractLinkText(focusAutoLinkNode);

              // NOTE: create a unique session ID for auto link
              newSessionId = `${focusAutoLinkNode.getKey()}-${newUrl}-${newText}`;

              setInitialLinkUrl(newUrl);
              setInitialLinkTarget(false);
              setInitialLinkText(newText);
              setLinkEditingSessionId(newSessionId);
              lastLinkNode.current = focusAutoLinkNode;
            }

            setIsLink(true);
            setEditMode(true);
          } else {
            setIsLink(false);
            setEditMode(false);
            lastLinkNode.current = null;
          }
        } else {
          setIsLink(false);
          setEditMode(false);
          lastLinkNode.current = null;
        }
      };

      return mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          editorState.read(() => {
            updateToolbar();
          });
        }),
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (_payload, newEditor) => {
            updateToolbar();
            setActiveEditor(newEditor);
            return false;
          },
          COMMAND_PRIORITY_CRITICAL
        ),
        editor.registerCommand(
          TOGGLE_LINK_COMMAND,
          payload => {
            if (isCreatingLink.current) {
              return false;
            }

            if (payload === null) {
              lastLinkNode.current = null;
              return false;
            }

            const selection = $getSelection();

            if ($isRangeSelection(selection) && !selection.isCollapsed()) {
              const selectedText = extractLinkText();
              const newSessionId = `new-link-${Date.now()}-${Math.random()}`;

              setInitialLinkUrl('');
              setInitialLinkTarget(true);
              setInitialLinkText(selectedText);
              setLinkEditingSessionId(newSessionId);
              setIsLink(true);
              setEditMode(true);
              lastLinkNode.current = null;
              return true;
            }

            return false;
          },
          COMMAND_PRIORITY_HIGH
        ),
        ...(isUrlValidationEnabled
          ? [
              editor.registerCommand(
                SHOW_LINK_EDITOR_COMMAND,
                () => {
                  // NOTE: reset everything for new link creation
                  lastLinkNode.current = null;

                  const selection = $getSelection();
                  const currentText = $isRangeSelection(selection)
                    ? selection.getTextContent()
                    : '';

                  const newSessionId = `new-link-${Date.now()}-${Math.random()}`;

                  setInitialLinkUrl('');
                  setInitialLinkTarget(true);
                  setInitialLinkText(currentText);
                  setLinkEditingSessionId(newSessionId);
                  setIsLink(true);
                  setEditMode(true);

                  editor.dispatchCommand(FORCE_UPDATE_LINK_EDITOR_COMMAND, null);
                  return true;
                },
                COMMAND_PRIORITY_HIGH
              ),
            ]
          : [])
      );
    },
    [editor, isUrlValidationEnabled, extractLinkText]
  );

  return createPortal(
    isEditMode ? (
      <FloatingLinkEditor
        editor={activeEditor}
        isLink={isLink}
        isEditMode={isEditMode}
        setEditMode={setEditMode}
        setIsLink={setIsLink}
        initialLinkUrl={initialLinkUrl}
        initialLinkTarget={initialLinkTarget}
        initialLinkText={initialLinkText}
        isCreatingLink={isCreatingLink}
        hadPreviousError={hadPreviousError}
        linkEditingSessionId={linkEditingSessionId}
      />
    ) : null,
    document.body
  );
}

export function onToolbarLinkButtonClick(editor: LexicalEditor): boolean {
  const isUrlValidationEnabled = isFeatureEnabled('urlValidation');

  if (!isUrlValidationEnabled) {
    editor.focus();
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url: '',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    return true;
  }

  editor.focus();
  setTimeout(() => {
    editor.getEditorState().read(() => {
      editor.dispatchCommand(SHOW_LINK_EDITOR_COMMAND, null);
    });
  }, 100);

  return true;
}

export default function FloatingLinkEditorPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const portal = useFloatingLinkEditorToolbar(editor);
  return portal as JSX.Element | null;
}
