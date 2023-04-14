import { useState } from "react";
import {DialogActions, DialogButtonsList} from '../../../ui/Dialog';

const ImageDialog = ({
  editor,
  onClose
}) => {

    const [src, setSrc] = useState('');
    const [altText, setAltText] = useState('');
  
    const isDisabled = src === '';
  
    return (
      <>
        <input
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
        />
        <DialogActions>
          <button
            data-test-id="image-modal-confirm-btn"
            disabled={isDisabled}
            //onClick={() => onClick({altText, src})}
           >
            Confirm
          </button>
        </DialogActions>
      </>
    );
  }

  export default ImageDialog;