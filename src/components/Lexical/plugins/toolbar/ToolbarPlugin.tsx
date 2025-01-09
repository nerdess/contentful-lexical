import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	FORMAT_TEXT_COMMAND,
	FORMAT_ELEMENT_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	$getSelection,
	$isRangeSelection,
	$setSelection,
	LexicalEditor,
	TextNode,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
	$isListNode,
	ListNode,
} from '@lexical/list';
import {$isHeadingNode} from '@lexical/rich-text';
import { getSelectedNode } from '../utils/getSelectedNode';
import { LowPriority } from './const';
import Divider from './divider/Divider';
import ImageDialog from '../image/ImageDialog';
import useModal from '../../../../hooks/useModal';
import BlockFormatDropDown from './formatsDropdown/formatsDropdown';
import { blockTypeToBlockName} from './formatsDropdown/const';


const wrap = ({ 
	editor,
	left = '', 
	right = ''
}: {
	editor: LexicalEditor;
	left: string;
	right?: string;
}) => {
	editor.update(() => {
		const selection = $getSelection() as any;
		if (!selection) return null;

		let _left = {key: null, offset: 0};
		let _right = {key: null, offset: 0};

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
				selection.anchor.key === keyOfFirstNode
					? { ...selection.anchor }
					: { ...selection.focus };
			_right =
				selection.anchor.key === keyOfFirstNode
					? { ...selection.focus }
					: { ...selection.anchor };
		}

		selection.getNodes().forEach((node: TextNode) => {
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

	const $updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode();
			const element =
				anchorNode.getKey() === 'root'
					? anchorNode
					: anchorNode.getTopLevelElementOrThrow();
			const elementKey = element.getKey();
			const elementDOM = editor.getElementByKey(elementKey);
			if (elementDOM !== null) {
				//setSelectedElementKey(elementKey);
				if ($isListNode(element)) {
					const parentList = $getNearestNodeOfType(anchorNode, ListNode);
					const type = parentList ? parentList.getTag() : element.getTag();
					setBlockType(type);
				} else {
					const type = $isHeadingNode(element)
						? element.getTag()
						: element.getType();
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
			//setIsRTL($isParentElementRTL(selection));

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
				  const parentList = $getNearestNodeOfType(
					anchorNode,
					ListNode,
				  );
				  const type = parentList
					? parentList.getListType()
					: element.getListType();
				  setBlockType(type);
				} else {

				  const type = $isHeadingNode(element)
					? element.getTag()
					: element.getType();
				  if (type in blockTypeToBlockName) {
					setBlockType(type);
				  }
				  /*if ($isCodeNode(element)) {
					const language =
					  element.getLanguage();
					setCodeLanguage(
					  language ? CODE_LANGUAGE_MAP[language] || language : '',
					);
					return;
				  }*/
				}
			  }

			/*if ($isImageNode(parent) || $isImageNode(node)) {
				setIsImage(true);
			} else {
				setIsImage(false);
			}*/
		}
	}, [editor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_payload, newEditor) => {
					$updateToolbar();
					return false;
				},
				LowPriority
			),
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				LowPriority
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
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
		  COMMAND_PRIORITY_CRITICAL,
		);
	  }, [editor, $updateToolbar]);

	useEffect(() => {
		return mergeRegister(
		  editor.registerEditableListener((editable) => {
			setIsEditable(editable);
		  }),
		  activeEditor.registerUpdateListener(({editorState}) => {
			editorState.read(() => {
			  $updateToolbar();
			});
		  }),
		  activeEditor.registerCommand(
			CAN_UNDO_COMMAND,
			(payload) => {
			  setCanUndo(payload);
			  return false;
			},
			COMMAND_PRIORITY_CRITICAL,
		  ),
		  activeEditor.registerCommand(
			CAN_REDO_COMMAND,
			(payload) => {
			  setCanRedo(payload);
			  return false;
			},
			COMMAND_PRIORITY_CRITICAL,
		  ),
		);
	  }, [$updateToolbar, activeEditor, editor]);

	/*const formatBulletList = () => {
		if (blockType !== 'ul') {
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND);
		}
	};

	const formatNumberedList = () => {
		if (blockType !== 'ol') {
			editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
		} else {
			editor.dispatchCommand(REMOVE_LIST_COMMAND);
		}
	};*/

	const insertLink = useCallback(() => {
		if (!isLink) {
			//editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, '');
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]);

	return (
		<div className='toolbar' ref={toolbarRef}>
			<button
				disabled={!canUndo}
				onClick={() => {
					editor.dispatchCommand(UNDO_COMMAND, undefined);
				}}
				className='toolbar-item spaced'
				aria-label='Undo'
			>
				<i className='format undo' />
			</button>
			<button
				disabled={!canRedo}
				onClick={() => {
					editor.dispatchCommand(REDO_COMMAND, undefined);
				}}
				className='toolbar-item'
				aria-label='Redo'
			>
				<i className='format redo' />
			</button>

			<Divider />

			<BlockFormatDropDown
				disabled={!isEditable}
				blockType={blockType}
				editor={editor}
          	/>

			<Divider />

			<button
				onClick={() => {
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
				}}
				className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
				aria-label='Format Bold'
			>
				<i className='format bold' />
			</button>
			<button
				onClick={() => {
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
				}}
				className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
				aria-label='Format Italics'
			>
				<i className='format italic' />
			</button>
			<button
				onClick={() => {
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
				}}
				className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
				aria-label='Format Underline'
			>
				<i className='format underline' />
			</button>
			<button
				onClick={() => {
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
				}}
				className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
				aria-label='Format Strikethrough'
			>
				<i className='format strikethrough' />
			</button>
			{/*<Divider />
			<button
				className={`toolbar-item spaced ${blockType === 'ul' ? 'active' : ''}`}
				onClick={formatBulletList}
			>
				<i className='format ul' />
			</button>
			<button
				className={`toolbar-item spaced ${blockType === 'ol' ? 'active' : ''}`}
				onClick={formatNumberedList}
			>
				<i className='format ol' />
			</button>*/}
			<Divider />
				<button
					className={`toolbar-item spaced`}
					onClick={() => {
						editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
					}}
				>
					<i className='format left-align' />
				</button>
				{/*<button
					className={`toolbar-item spaced`}
					onClick={() => {
						editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
					}}
				>
					<i className='format center-align' />
				</button>*/}
			
			<Divider />
			<button
				onClick={() => {
					wrap({
						left: '„',
						right: '“',
						editor,
					});
				}}
				className={'toolbar-item spaced ' /*+ (isLink ? 'active' : '')*/}
				aria-label='Insert quotation marks'
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
				className={'toolbar-item spaced '}
				aria-label='Insert ndash'
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
				className={'toolbar-item spaced '}
				aria-label='Insert mdash'
			>
				<i className='format mdash' />
			</button>
			<Divider />
			<button
				onClick={insertLink}
				className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
				aria-label='Insert Link'
			>
				<i className='format link' />
			</button>
			<Divider />
			<button
				onClick={() => {
					showModal('Insert Image', (onClose, onOK) => (
						<ImageDialog editor={editor} onClose={onClose} /*onOK={onOK}*/ />
					));
				}}
				className={'toolbar-item spaced '}
			>
				<i className='format image' />
			</button>
			<Divider />
			<button
				onClick={() => {
					showModal('Insert Image', (onClose, onOK) => (
						<ImageDialog editor={editor} onClose={onClose} /*onOK={onOK}*/ />
					));
				}}
				className={'toolbar-item spaced '}
			>
				<i className='format image' />
			</button>
			
			{modal}
		</div>
	);
};

export default ToolbarPlugin;
