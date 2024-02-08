import * as React from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type {
	BaseSelection,
	LexicalEditor,
	NodeKey,
	NodeSelection,
	RangeSelection,
} from 'lexical';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	DRAGSTART_COMMAND,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $isImageNode } from './ImageNode';
import ImageDialog from '../plugins/image/ImageDialog';
import useModal from '../../../hooks/useModal';
import { ButtonGroup, IconButton } from '@contentful/f36-components';
import { DeleteIcon, EditIcon } from '@contentful/f36-icons';
import './ImageComponent.scss';

const imageCache = new Set();

function useSuspenseImage(src: string) {
	if (!imageCache.has(src)) {
		throw new Promise((resolve) => {
			const img = new Image();
			img.src = src;
			img.onload = () => {
				imageCache.add(src);
				resolve(null);
			};
		});
	}
}

function LazyImage({
	altText,
	title,
	className,
	imageRef,
	src,
	width,
	height,
	maxWidth,
}: {
	altText: string;
	title: string;
	className: string | null;
	height: 'inherit' | number;
	imageRef: { current: null | HTMLImageElement };
	maxWidth: number;
	src: string;
	width: 'inherit' | number;
}): JSX.Element {

	useSuspenseImage(src);
	
	return (
		<img
			className={className || undefined}
			src={src}
			alt={altText}
			title={title}
			ref={imageRef}
			/*style={{
				display: 'block',
				maxWidth: 570,
				margin: '0 auto',
      		}}*/
			draggable="false"
		/>
	);
}

export default function ImageComponent({
	src,
	altText,
	title,
	width,
	height,
	maxWidth,
	nodeKey,
}: {
	altText: string;
	title: string;
	caption: LexicalEditor;
	height: 'inherit' | number;
	maxWidth: number;
	nodeKey: NodeKey;
	resizable: boolean;
	showCaption: boolean;
	src: string;
	width: 'inherit' | number;
	captionsEnabled: boolean;
}): JSX.Element {

	const imageRef = useRef<null | HTMLImageElement>(null);
	const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(
		nodeKey
	);
	//const [isResizing, setIsResizing] = useState<boolean>(false);
	/*const [selection, setSelection] = useState<
		RangeSelection | NodeSelection | null
	>(null);*/
	const [selection, setSelection] = useState<
		BaseSelection | null
	>(null);

	const [editor] = useLexicalComposerContext();
	const draggable = isSelected && $isNodeSelection(selection); /* && !isResizing*/
	const isFocused = isSelected; /*|| isResizing*/
	const activeEditorRef = useRef<LexicalEditor | null>(null);

	const onDelete = useCallback(
		(payload: KeyboardEvent) => {
			if (isSelected && $isNodeSelection($getSelection())) {
				const event: KeyboardEvent = payload;
				event.preventDefault();
				const node = $getNodeByKey(nodeKey);
				if ($isImageNode(node)) {
					node.remove();
				}
				setSelected(false);
			}
			return false;
		},
		[isSelected, nodeKey, setSelected]
	);

	useEffect(() => {
		let isMounted = true;
		const unregister = mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				if (isMounted) {
					setSelection(editorState.read(() => $getSelection()));
				}
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, activeEditor) => {
					activeEditorRef.current = activeEditor;
					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand<MouseEvent>(
				CLICK_COMMAND,
				(payload) => {
					const event = payload;

					/*if (isResizing) {
						return true;
					}*/
					if (event.target === imageRef.current) {
						if (event.shiftKey) {
							setSelected(!isSelected);
						} else {
							clearSelection();
							setSelected(true);
						}
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				DRAGSTART_COMMAND,
				(event) => {
					if (event.target === imageRef.current) {
						// TODO This is just a temporary workaround for FF to behave like other browsers.
						// Ideally, this handles drag & drop too (and all browsers).
						event.preventDefault();
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW
			)
		);
		return () => {
			isMounted = false;
			unregister();
		};
	}, [
		clearSelection,
		editor,
		//isResizing,
		isSelected,
		nodeKey,
		onDelete,
		setSelected,
	]);

	const [modal, showModal] = useModal();

	return (
		<>
			<Suspense fallback={null}>
				<div
					className='image-component'
					draggable={draggable}
				>
					<LazyImage
						className={
							isFocused
								? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}`
								: null
						}
						src={src}
						altText={altText}
						title={title}
						imageRef={imageRef}
						width={width}
						height={height}
						maxWidth={maxWidth}
					/>
					{isFocused && (
						<ButtonGroup className='image-component-tools'>
							<IconButton
								aria-label='Delete image'
								size='small'
								icon={<DeleteIcon />}
								variant='secondary'
								onClick={(e: React.MouseEvent) => {
									editor.update(() => {
										const node = $getNodeByKey(nodeKey);
										if ($isImageNode(node)) {
											node.remove();
										}
										setSelected(false);
										e.preventDefault();
									});
								}}
							/>

							<IconButton
								aria-label='Edit image'
								size='small'
								icon={<EditIcon />}
								variant='secondary'
								onClick={() => {
									showModal('Edit Image', (onClose, onOK) => (
										<ImageDialog
											editor={editor}
											onClose={onClose}
											onOK={onOK}
											mode='edit'
											nodeKey={nodeKey}
											image={{
												src,
												altText,
												title,
												width,
												height,
												maxWidth,
											}}
										/>
									));
								}}
							/>
						</ButtonGroup>
					)}
				</div>
			</Suspense>
			{modal}
		</>
	);
}
