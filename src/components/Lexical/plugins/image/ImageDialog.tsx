import { useState } from 'react';
import {
	TextInput,
	Modal,
	FormControl,
	Button,
} from '@contentful/f36-components';
import { 
	INSERT_IMAGE_COMMAND,
	InsertImagePayload
 } from './ImagePlugin';
 import { $isImageNode } from '../../nodes/ImageNode';
 import { 
	$getNodeByKey,
	LexicalEditor
 } from 'lexical';

const ImageDialog = ({ 
	editor,
	onClose,
	mode, 
	nodeKey,
	image = {}
}:{
	editor: LexicalEditor,
	onClose: () => void,
	mode?: 'edit' | null,
	nodeKey?: string,
	image?: any
}) => {

	
	const [src, setSrc] = useState(image.src || '');
	const [title, setTitle] = useState(image.title || '');
	const [altText, setAltText] = useState(image.altText || '');

	const addImage = (payload: InsertImagePayload) => {

		editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);

    	onClose();
	};

	const editImage = (payload: InsertImagePayload) => {
		editor.update(() => {
			if (nodeKey) {
				const node = $getNodeByKey(nodeKey);
				if ($isImageNode(node)) {
					node.selectNext();
					node.remove();
				}
			}
		});
		editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
    	onClose();
	};

	return (
		<>
			<FormControl>
				<FormControl.Label>Bildlink</FormControl.Label>
				<TextInput
					value={src}
					type='text'
					name='src'
					placeholder='http://images.ctfassets.net/...'
					onChange={(e) => setSrc(e.target.value)}
				/>
			</FormControl>
			<FormControl>
				<FormControl.Label>Titel</FormControl.Label>
				<TextInput
					value={title}
					type='text'
					name='title'
					placeholder=''
					onChange={(e) => setTitle(e.target.value)}
				/>
			</FormControl>
			<FormControl>
				<FormControl.Label>Alt-Text</FormControl.Label>
				<TextInput
					value={altText}
					type='text'
					name='altText'
					placeholder=''
					onChange={(e) => setAltText(e.target.value)}
				/>
			</FormControl>

			<Modal.Controls style={{ margin: 0 }}>
				<Button size='small' variant='transparent' onClick={onClose}>
					Cancel
				</Button>
				<Button
					size='small'
					variant='positive'
					onClick={() => {

						if (mode === 'edit') {
							editImage({
								altText,
								src,
								title,
							});
							return;
						}

						addImage({
							altText,
							src,
							title,
						});
					}}
				>
					OK
				</Button>
			</Modal.Controls>
		</>
	);
};

export default ImageDialog;
