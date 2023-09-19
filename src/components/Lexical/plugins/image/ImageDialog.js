import { useState } from 'react';
import {
	TextInput,
	Modal,
	FormControl,
	Button,
} from '@contentful/f36-components';
import { 
	INSERT_IMAGE_COMMAND
 } from './ImagePlugin';
 import { $isImageNode } from '../../nodes/ImageNode';
 import { 
	$getNodeByKey,
	$getSelection
 } from 'lexical';

const ImageDialog = ({ editor, onClose, onOK, mode, nodeKey, image = {} }) => {

	
	const [src, setSrc] = useState(image.src || '');
	const [title, setTitle] = useState(image.title || '');
	const [altText, setAltText] = useState(image.altText || '');

	const addImage = (payload) => {

		/*editor.getEditorState().read(() => {
			const selection = $getSelection();
			console.log('selection', selection, selection.length)
			//const first = selection[0];
			//console.log('first', first, first.getType());
		});*/

		editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);



    	onClose();
	};

	const editImage = (payload) => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.selectNext();
				node.remove();
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
