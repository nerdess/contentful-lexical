import {useEffect, } from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {/*ParagraphNode, RootNode,*/ TextNode} from 'lexical';
import { cleanup } from '../helper';

//Not in use, cleanup is happening inside clipboard.ts

const CleanupPlugin = () => {

  const [editor] = useLexicalComposerContext();

  useEffect(() => {

    editor.registerNodeTransform(TextNode, (textNode) => {
      const textContent = textNode.getTextContent();
      const textContentCleanedUp = cleanup(textContent);

      if (textContent !== textContentCleanedUp) {
        //console.log('ttt', textContent, textContentCleanedUp);
        //textNode.setTextContent(textContentCleanedUp);
      }

    });

    /*editor.registerNodeTransform(ParagraphNode, (paragraphNode) => {
      const textContent = paragraphNode.getTextContent();
      const textContentCleanedUp = cleanup(textContent);

      if (textContent !== textContentCleanedUp) {
        console.log('PARAGRAPHNODE');
        //paragraphNode.setTextContent(textContentCleanedUp);
        //paragraphNode.set
      }
      
    });

    editor.registerNodeTransform(RootNode, (rootNode) => {
      const textContent = rootNode.getTextContent();
      const textContentCleanedUp = cleanup(textContent);

      if (textContent !== textContentCleanedUp) {
        console.log('TEXTNODE');
        //rootNode.setTextContent(textContentCleanedUp);
        //rootNode.set
      }
    });*/

  }, [editor]);

  return null;

}

export default CleanupPlugin;