import { useState } from 'react';
import {
	TextInput,
	Modal,
	FormControl,
	Button,
} from '@contentful/f36-components';
import { INSERT_IMAGE_COMMAND } from '../ImagePlugin';

const ImageDialog = ({ editor, onClose, onOK }) => {

	const [src, setSrc] = useState('');
	const [title, setTitle] = useState('');
	const [altText, setAltText] = useState('');

	const addImage = (payload) => {
		editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
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
				{/*<FormControl.HelpText>Provide your email address</FormControl.HelpText>
            {!src && (
              <FormControl.ValidationMessage>
                Please, provide your email
              </FormControl.ValidationMessage>
            )}*/}
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

			{/*<input
          label="Image URL"
          placeholder="i.e. https://source.unsplash.com/random"
          onChange={setSrc}
          value={src}
          data-test-id="image-modal-url-input"
        />
       
        <input
          label="Alt Text"
          placeholder="Random unsplash image"
          onChange={setAltText}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />*/}

			{/*<DialogActions>
          <button
            data-test-id="image-modal-confirm-btn"
            disabled={isDisabled}
            //onClick={() => onClick({altText, src})}
           >
            Confirm
          </button>
      </DialogActions>*/}
		</>
	);
};

export default ImageDialog;
