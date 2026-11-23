import { createEditor, LexicalEditor } from 'lexical';

import { editorConfig } from '../../src/components/Lexical/editorConfig';
import { $getHtml, $setHtml } from '../../src/components/Lexical/html';

export const createTestEditor = (): LexicalEditor =>
  createEditor({
    namespace: editorConfig.namespace,
    theme: editorConfig.theme,
    nodes: editorConfig.nodes,
    onError: (error: Error) => {
      throw error;
    },
  });

export const update = (editor: LexicalEditor, fn: () => void) => {
  editor.update(fn, { discrete: true });
};

export const roundTripHtml = (html: string): string => {
  const editor = createTestEditor();
  update(editor, () => $setHtml(editor, html));
  return editor.read(() => $getHtml(editor));
};
