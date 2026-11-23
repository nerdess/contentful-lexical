import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $createParagraphNode, $getRoot, $insertNodes, LexicalEditor, LexicalNode } from 'lexical';

export function $htmlToNodes(editor: LexicalEditor, htmlString: string | null | undefined) {
  const dom = new DOMParser().parseFromString(htmlString || '', 'text/html');

  return $generateNodesFromDOM(editor, dom)
    .map((node: LexicalNode) => {
      if (node.getType() === 'text' || node.getType() === 'custom-text') {
        return node.getTextContent().trim() === '' ? null : $createParagraphNode().append(node);
      }

      if (node.getType() === 'linebreak') {
        return null;
      }

      return node;
    })
    .filter((node): node is LexicalNode => node !== null);
}

export function $setHtml(editor: LexicalEditor, htmlString: string | null | undefined) {
  const nodes = $htmlToNodes(editor, htmlString);

  const root = $getRoot();
  root.select();
  root.clear();
  $insertNodes(nodes);
}

export function $getHtml(editor: LexicalEditor): string {
  return $generateHtmlFromNodes(editor, null);
}
