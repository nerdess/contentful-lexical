import {useEffect, } from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
//import {TextNode} from 'lexical';
//import { cleanup } from '../helper';

//Not in use, cleanup is happening inside clipboard.ts

const CleanupPlugin = () => {

  const [editor] = useLexicalComposerContext();

  useEffect(() => {

    /*editor.registerNodeTransform(TextNode, (textNode) => {

      const textContent = textNode.getTextContent();
      const textContentCleanedUp = cleanup(textNode.getTextContent());

      console.log('...', textContent, textContentCleanedUp);

      if (textContent !== textContentCleanedUp) {
        console.log('done!', textContentCleanedUp)
        textNode.setTextContent(textContentCleanedUp);
      }
    });*/

  }, [editor]);

  return null;

}

export default CleanupPlugin;