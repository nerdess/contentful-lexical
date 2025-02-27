import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';
import { HeadingNode } from '@lexical/rich-text';

// This plugin will transform all h4 tags to h2 tags
const TransformH4toH2Plugin = () => {

  const [editor] = useLexicalComposerContext();
  useEffect(() => {

   return editor.registerNodeTransform(HeadingNode, (headingNode) => {
      const headingTag = headingNode.getTag();
      if (headingTag === 'h4') {
        headingNode.setTag('h2');
      }
    });

  }, [editor]);

  return null;
}

export default TransformH4toH2Plugin;