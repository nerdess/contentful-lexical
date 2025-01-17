/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
	$isAutoLinkNode,
	$isLinkNode,
	TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	$setSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	KEY_ESCAPE_COMMAND,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
	BaseSelection,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { setFloatingElemPositionForLinkEditor } from '../../utils/setFloatingElemPositionForLinkEditor';
import {
	DeleteIcon,
	CloseIcon,
	DoneIcon,
} from '@contentful/f36-icons';
import { TextInput, Checkbox, Button } from '@contentful/f36-components';

import './floatingLinkEditorPlugin.css';
import {
	Box,
	ButtonGroup,
	Stack,
} from '@contentful/f36-components';

function FloatingLinkEditor({
	editor,
	isLink,
	setIsLink,
	anchorElem,
	isEditMode,
	setEditMode
}: {
	editor: LexicalEditor;
	isLink: boolean;
	setIsLink: Dispatch<boolean>;
	anchorElem: HTMLElement;
	isEditMode: boolean;
	setEditMode: Dispatch<boolean>;
}): JSX.Element {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [linkUrl, setLinkUrl] = useState('');
	const [editedLinkOpenNewWindow, setEditedLinkOpenNewWindow] = useState(false);
	const [lastSelection, setLastSelection] = useState<
		BaseSelection | null
	>(null);

	const updateLinkEditor = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const parent = node.getParent();

			if ($isLinkNode(parent)) {
				setLinkUrl(parent.getURL());
				setEditedLinkOpenNewWindow(
					parent.getTarget() === '_blank'
				);
			} else if ($isLinkNode(node)) {
				setLinkUrl(node.getURL());
				setEditedLinkOpenNewWindow(
					node.getTarget() === '_blank'
				);
			} else {
				setLinkUrl('');
				setEditedLinkOpenNewWindow(false);
			}
		}
		const editorElem = editorRef.current;
		const nativeSelection = window.getSelection();
		const activeElement = document.activeElement;

		if (editorElem === null) {
			return;
		}

		const rootElement = editor.getRootElement();

		if (
			selection !== null &&
			nativeSelection !== null &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode) &&
			editor.isEditable()
		) {
			const domRect:
				| DOMRect
				| undefined = nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
			if (domRect) {
				domRect.y += 40;
				setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
			}
			setLastSelection(selection);
		} else if (!activeElement || activeElement.className !== 'link-input') {
			if (rootElement !== null) {
				setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
			}
			setLastSelection(null);
			setEditMode(false);
			setLinkUrl('');
		}

		return true;
	}, [anchorElem, editor, setEditMode]);

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				updateLinkEditor();
			});
		};

		window.addEventListener('resize', update);

		if (scrollerElem) {
			scrollerElem.addEventListener('scroll', update);
		}

		return () => {
			window.removeEventListener('resize', update);

			if (scrollerElem) {
				scrollerElem.removeEventListener('scroll', update);
			}
		};
	}, [anchorElem.parentElement, editor, updateLinkEditor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateLinkEditor();
					return true;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				() => {
					if (isLink) {
						setIsLink(false);
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_HIGH
			)
		);
	}, [editor, updateLinkEditor, setIsLink, isLink]);

	useEffect(() => {
		if (isEditMode && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditMode]);

	const monitorInputInteraction = (
		event: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleLinkSubmission();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			setEditMode(false);
		}
	};

	const handleLinkSubmission = () => {
		if (lastSelection !== null) {
			if (!!linkUrl) {
				editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
					url: sanitizeUrl(linkUrl),
					target: editedLinkOpenNewWindow ? '_blank' : '_self',
					rel: editedLinkOpenNewWindow ? 'noopener noreferrer' : '',
				});
			} else {
				editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
			}
		}
		editor.update(() => {
			$setSelection(null);
			setEditMode(false);
		});
	};

	return (
		<div ref={editorRef} className='link-editor'>
			{isEditMode && (
				<Stack
					flexDirection='column'
					alignItems='start'
					spacing='spacingXs'
					fullWidth
				>
					<Stack flexDirection='row' fullWidth>
						<Box style={{ flex: 1 }}>
							<TextInput
								ref={inputRef}
								value={linkUrl}
								onChange={(event) => {
									setLinkUrl(event.target.value);
								}}
								onKeyDown={(event: any) => {
									monitorInputInteraction(event);
								}}
							/>
						</Box>
						<Box>
							<Checkbox
								isChecked={editedLinkOpenNewWindow}
								onChange={() => {
									setEditedLinkOpenNewWindow((prev) => !prev);
								}}
							>
								Open in new tab
							</Checkbox>
						</Box>
					</Stack>
					<Stack justifyContent='space-between' fullWidth>
						<Box>
							<ButtonGroup>
								<Button
									aria-label='Cancel'
									size='small'
									endIcon={<CloseIcon />}
									tabIndex={0}
									onMouseDown={(event: React.MouseEvent) =>
										event.preventDefault()
									}
									onClick={() => {
										if (!linkUrl) {
											editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
										}
										setEditMode(false);
									}}
								>
									Cancel
								</Button>
								<Button
									aria-label='Delete link'
									size='small'
									endIcon={<DeleteIcon />}
									tabIndex={0}
									onMouseDown={(event: React.MouseEvent) =>
										event.preventDefault()
									}
									onClick={() => {
										editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
									}}
								>
									Delete
								</Button>
							</ButtonGroup>
						</Box>
						<Box>
							<Button
								aria-label='Save'
								size='small'
								variant='primary'
								endIcon={<DoneIcon />}
								tabIndex={0}
								onMouseDown={(event: React.MouseEvent) =>
									event.preventDefault()
								}
								onClick={handleLinkSubmission}
							>
								Save
							</Button>
						</Box>
					</Stack>
				</Stack>
			)} 
			
		</div>
	);
}

function useFloatingLinkEditorToolbar(
	editor: LexicalEditor,
	anchorElem: HTMLElement
): any {
	const [activeEditor, setActiveEditor] = useState(editor);
	const [isLink, setIsLink] = useState(false);
	const [isEditMode, setEditMode] = useState(false);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const linkParent = $findMatchingParent(node, $isLinkNode);
			const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

			// We don't want this menu to open for auto links.
			if (linkParent != null && autoLinkParent === null) {
				setIsLink(true);
				setEditMode(true);
			} else {
				setIsLink(false);
				setEditMode(false);
			}

		}
	}, []);

	useEffect(() => {
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
			)
		);
	}, [editor, updateToolbar]);

	return createPortal(
		<FloatingLinkEditor
			editor={activeEditor}
			isLink={isLink}
			isEditMode={isEditMode}
			setEditMode={setEditMode}
			anchorElem={anchorElem}
			setIsLink={setIsLink}
		/>,
		anchorElem
	);
}

export default function FloatingLinkEditorPlugin({
	anchorElem = document.body,
}: {
	anchorElem?: HTMLElement;
}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	return useFloatingLinkEditorToolbar(editor, anchorElem);
}
