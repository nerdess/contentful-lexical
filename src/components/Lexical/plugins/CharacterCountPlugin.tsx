import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {RootNode} from 'lexical';
//import { $generateHtmlFromNodes } from '@lexical/html';
import {useEffect, useState} from 'react';
import { Badge } from '@contentful/f36-components';

const CharacterCountPlugin = () => {

  //const sdk = useSDK();

  const [editor] = useLexicalComposerContext();
  const [characterCount, setCharacterCount] = useState(0);

  //todo: use this to count html characters
  //const [htmlCount, setHtmlCount] = useState(0);
  //const htmlCount = (sdk.field.getValue() || '').length;

  useEffect(() => {

    return editor.registerNodeTransform(RootNode, (rootNode) => {
      setCharacterCount(rootNode.getTextContentSize())
    });

  }, [editor]);

  return (
    <Badge variant="secondary">
      <span style={{textTransform: 'none'}}>
        {characterCount} characters
      </span>
    </Badge>
  );
}

export default CharacterCountPlugin;