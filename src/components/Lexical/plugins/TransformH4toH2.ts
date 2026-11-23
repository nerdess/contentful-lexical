import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode, HeadingNode } from '@lexical/rich-text';
import { useEffect } from 'react';

// This plugin transforms all <h4> elements to <h2> elements in the editor
// Reason: backwards compatibility with the old HTML structure
const TransformH4ToH2 = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(HeadingNode, node => {
      if ($isHeadingNode(node) && node.getTag() === 'h4') {
        node.setTag('h2');
      }
    });
  }, [editor]);

  return null;
};

export default TransformH4ToH2;
