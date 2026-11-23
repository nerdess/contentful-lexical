import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $getNearestNodeOfType, $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  $getSelection,
  $isRangeSelection,
  $setSelection,
  LexicalEditor,
  $createParagraphNode,
  $isRootNode,
  $isTextNode,
  RangeSelection,
  PASTE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useModal from '../../../../hooks/useModal';
import DropDown, { DropDownItem } from '../../../ui/DropDown';
import { $isQuoteAuthorNode } from '../../nodes/Quote/QuoteAuthorNode';
import { $isQuoteContainerNode } from '../../nodes/Quote/QuoteContainerNode';
import { $isQuoteContentNode } from '../../nodes/Quote/QuoteContentNode';
import QuoteModal from '../../nodes/Quote/QuoteModal';
import InsertFAQDialog from '../FAQPlugin/InsertFAQDialog';
import ImageDialog from '../image/ImageDialog';
import { getSelectedNode } from '../utils/getSelectedNode';

import { LowPriority, QUOTATION_MARKS } from './const';
import Divider from './divider/Divider';
import BlockFormatDropDown from './formatsDropdown/formatsDropdown';
import {
  FORCE_UPDATE_LINK_EDITOR_COMMAND,
  LINK_EDITOR_VISIBILITY_COMMAND,
} from './link/FloatingLinkEditorPlugin';

const wrap = ({
  editor,
  left = '',
  right = '',
}: {
  editor: LexicalEditor;
  left: string;
  right?: string;
}) => {
  editor.update(() => {
    const selection = $getSelection() as RangeSelection | null;
    if (!selection) return null;

    let _left: { key: string | null; offset: number } = { key: null, offset: 0 };
    let _right: { key: string | null; offset: number } = { key: null, offset: 0 };

    if (selection.getNodes().length === 1) {
      _left =
        selection.anchor.offset > selection.focus.offset
          ? { ...selection.focus }
          : { ...selection.anchor };
      _right =
        selection.anchor.offset < selection.focus.offset
          ? { ...selection.focus }
          : { ...selection.anchor };
    } else {
      const keyOfFirstNode = selection.getNodes()[0].getKey();
      _left =
        selection.anchor.key === keyOfFirstNode ? { ...selection.anchor } : { ...selection.focus };
      _right =
        selection.anchor.key === keyOfFirstNode ? { ...selection.focus } : { ...selection.anchor };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selection.getNodes().forEach((node: any) => {
      // If the node is the root node
      if ($isRootNode(node)) {
        const paragraph = $createParagraphNode();
        node.append(paragraph);
        paragraph.select();
        const selection = $getSelection();
        selection?.insertText(left);
        if (right) {
          selection?.insertText(right);
        }
        return;
      }

      // If the node is a text node
      if (!$isTextNode(node) && node.isEmpty()) {
        node.select();
        const selection = $getSelection();
        selection?.insertText(left);
        if (right) {
          selection?.insertText(right);
        }
        return;
      }

      if (node.getKey() === _left.key) {
        node.setTextContent(
          node.getTextContent().substring(0, _left.offset) +
            left +
            node.getTextContent().slice(_left.offset)
        );
      }

      if (node.getKey() === _right.key) {
        node.setTextContent(
          node.getTextContent().substring(0, _right.offset + left.length) +
            right +
            node.getTextContent().slice(_right.offset + left.length)
        );
      }
    });

    $setSelection(null);
  });
};

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isInsideCitation, setIsInsideCitation] = useState(false);
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);

  const { t } = useTranslation();

  const $isSelectionInCitation = useCallback((): boolean => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const quoteContainer = $findMatchingParent(anchorNode, $isQuoteContainerNode);
    const quoteContent = $findMatchingParent(anchorNode, $isQuoteContentNode);
    const quoteAuthor = $findMatchingParent(anchorNode, $isQuoteAuthorNode);

    return Boolean(quoteContainer || quoteContent || quoteAuthor);
  }, []);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      setIsInsideCitation($isSelectionInCitation());

      if (elementDOM !== null) {
        //setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
          /*if ($isCodeNode(element)) {
						setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
					}*/
        }
      }
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        //setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        }
      }
    }

    /*if ($isImageNode(parent) || $isImageNode(node)) {
				setIsImage(true);
			} else {
				setIsImage(false);
			}*/
  }, [editor, $isSelectionInCitation]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener(editable => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand(
        FORMAT_TEXT_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && $isSelectionInCitation()) {
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      activeEditor.registerCommand(
        PASTE_COMMAND,
        payload => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && $isSelectionInCitation()) {
            // Try to extract plain text from the paste payload
            let plainText: string | null = null;

            // Check if payload has clipboard data
            if (payload && typeof payload === 'object') {
              if ('clipboardData' in payload && payload.clipboardData) {
                plainText = (payload.clipboardData as DataTransfer).getData('text/plain');
              } else if (
                'data' in payload &&
                payload.data &&
                typeof payload.data === 'object' &&
                'clipboardData' in payload.data
              ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const clipboardData = (payload.data as any).clipboardData;
                if (clipboardData && typeof clipboardData.getData === 'function') {
                  plainText = clipboardData.getData('text/plain');
                }
              }
            }

            if (plainText) {
              selection.insertText(plainText);
              return true;
            }

            // Fallback: try to get text from navigator.clipboard
            if (navigator.clipboard && navigator.clipboard.readText) {
              navigator.clipboard
                .readText()
                .then(text => {
                  if (text) {
                    activeEditor.update(() => {
                      const currentSelection = $getSelection();
                      if ($isRangeSelection(currentSelection)) {
                        currentSelection.insertText(text);
                      }
                    });
                  }
                })
                .catch(() => {
                  console.warn('Could not access clipboard for plain text paste in citation');
                });
              return true;
            }

            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [$updateToolbar, activeEditor, editor, $isSelectionInCitation]);

  useEffect(
    function listenForLinkEditorVisibility() {
      return editor.registerCommand(
        LINK_EDITOR_VISIBILITY_COMMAND,
        (payload: boolean) => {
          setIsLinkEditorOpen(payload);
          return false;
        },
        LowPriority
      );
    },
    [editor]
  );

  const insertLink = useCallback(() => {
    if (isInsideCitation) {
      return;
    }

    if (isLink) {
      // NOTE: if a link is already selected, we want to edit it, not remove it.
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // NOTE: manually collapse the selection to its starting point (the "anchor").
          const anchor = selection.anchor;
          selection.focus.set(anchor.key, anchor.offset, anchor.type);
        }
      });
      editor.dispatchCommand(FORCE_UPDATE_LINK_EDITOR_COMMAND, null);
    } else {
      // NOTE: this is the logic for creating a new link. It remains the same.
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        url: '',
        target: '_blank',
      });
      editor.dispatchCommand(FORCE_UPDATE_LINK_EDITOR_COMMAND, null);
    }
  }, [editor, isLink, isInsideCitation]);

  return (
    <div className='toolbar' ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className='toolbar-item spaced'
        aria-label={t('editor.undo')}
        title={t('editor.undo')}
      >
        <i className='format undo' />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className='toolbar-item'
        aria-label={t('editor.redo')}
        title={t('editor.redo')}
      >
        <i className='format redo' />
      </button>

      <Divider />

      <BlockFormatDropDown
        disabled={!isEditable || isInsideCitation}
        blockType={blockType}
        editor={editor}
      />

      <Divider />

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
        aria-label={t('editor.styles.bold')}
        disabled={blockType === 'h2' || isInsideCitation}
        title={t('editor.styles.bold')}
      >
        <i className='format bold' />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
        aria-label={t('editor.styles.italic')}
        disabled={blockType === 'h2' || isInsideCitation}
        title={t('editor.styles.italic')}
      >
        <i className='format italic' />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
        aria-label={t('editor.styles.underline')}
        disabled={blockType === 'h2' || isInsideCitation}
        title={t('editor.styles.underline')}
      >
        <i className='format underline' />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
        aria-label={t('editor.styles.strikethrough')}
        disabled={blockType === 'h2' || isInsideCitation}
        title={t('editor.styles.strikethrough')}
      >
        <i className='format strikethrough' />
      </button>
      <Divider />
      <button
        className={`toolbar-item spaced`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        aria-label={t('editor.styles.leftAlign')}
        disabled={isInsideCitation}
        title={t('editor.styles.leftAlign')}
      >
        <i className='format left-align' />
      </button>
      <Divider />
      <button
        onClick={insertLink}
        className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
        aria-label={t('editor.styles.insertLink')}
        disabled={isInsideCitation || isLinkEditorOpen}
        title={t('editor.styles.insertLink')}
      >
        <i className='format link' />
      </button>
      <Divider />
      <button
        onClick={() => {
          showModal(t('editor.styles.insertImage'), onClose => (
            <ImageDialog editor={editor} onClose={onClose} />
          ));
        }}
        className='toolbar-item spaced'
        aria-label={t('editor.styles.insertImage')}
        disabled={isInsideCitation}
        title={t('editor.styles.insertImage')}
      >
        <i className='format image' />
      </button>
      <Divider />
      <button
        onClick={() => {
          wrap({
            left: QUOTATION_MARKS.LEFT,
            right: QUOTATION_MARKS.RIGHT,
            editor,
          });
        }}
        aria-label={t('editor.special.quotationMarks')}
        title={t('editor.special.quotationMarks')}
        className='toolbar-item spaced'
        disabled={isInsideCitation}
      >
        <i className='format quotation-marks' />
      </button>
      <button
        onClick={() => {
          wrap({
            left: '–',
            editor,
          });
        }}
        aria-label={t('editor.special.enDash')}
        title={t('editor.special.enDash')}
        className='toolbar-item spaced'
        disabled={isInsideCitation}
      >
        <i className='format ndash' />
      </button>
      <button
        onClick={() => {
          wrap({
            left: '—',
            editor,
          });
        }}
        aria-label={t('editor.special.emDash')}
        title={t('editor.special.emDash')}
        className='toolbar-item spaced'
        disabled={isInsideCitation}
      >
        <i className='format mdash' />
      </button>
      <Divider />
      <DropDown
        disabled={!isEditable || isInsideCitation}
        buttonClassName='toolbar-item spaced'
        buttonLabel={t('editor.special.insert')}
        buttonAriaLabel={
          isInsideCitation ? t('editor.special.insertDisabled') : t('editor.special.insertNode')
        }
        tooltipContent={
          isInsideCitation ? t('editor.special.insertDisabled') : t('editor.special.specialNode')
        }
      >
        <DropDownItem
          onClick={() => {
            showModal(t('editor.special.citation'), onClose => (
              <QuoteModal isShown={true} onClose={onClose} />
            ));
          }}
          className='item'
          title={t('editor.special.citationDisplay')}
        >
          <i className='icon quote' />
          <span className='text'>{t('editor.special.citation')}</span>
        </DropDownItem>

        <DropDownItem
          onClick={() => {
            showModal(t('editor.special.faq'), onClose => (
              <InsertFAQDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
          className='item'
          title={t('editor.special.faqDisplay')}
        >
          <i className='icon faq' />
          <span className='text'>{t('editor.special.faq')}</span>
        </DropDownItem>

        {/*<DropDownItem
                  onClick={() => {
                    editor.dispatchCommand(
            INSERT_FAQ_ITEM_COMMAND, undefined
                    );
                  }}
                  className="item">
                  <i className="icon faq" />
                  <span className="text">FAQ Item</span>
                </DropDownItem>*/}
      </DropDown>

      {modal}
    </div>
  );
};

export default ToolbarPlugin;
