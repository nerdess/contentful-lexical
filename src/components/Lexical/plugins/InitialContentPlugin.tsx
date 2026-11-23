import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

import { $setHtml } from '../html';

const InitialContentPlugin = ({ htmlString }: { htmlString: string }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      $setHtml(editor, htmlString);
    });
  }, [editor, htmlString]);

  return null;
};

export default InitialContentPlugin;
