/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$generateNodesFromDOM} from '@lexical/html';
import {$generateNodesFromSerializedNodes, $insertGeneratedNodes} from '@lexical/clipboard';

import {
  $createTabNode,
  $isRangeSelection,
  GridSelection,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
} from 'lexical';


const getCleanedNodes = (nodes: LexicalNode[]): LexicalNode[] => {

    //filter out empty paragraphs
    const result = nodes.filter((node: LexicalNode) => {

        return node.getTextContent().trim().length > 0;
    });

    return result;

}

/**
 * Attempts to insert content of the mime-types application/x-lexical-editor, text/html,
 * text/plain, or text/uri-list (in descending order of priority) from the provided DataTransfer
 * object into the editor at the provided selection.
 *
 * @param dataTransfer an object conforming to the [DataTransfer interface] (https://html.spec.whatwg.org/multipage/dnd.html#the-datatransfer-interface)
 * @param selection the selection to use as the insertion point for the content in the DataTransfer object
 * @param editor the LexicalEditor the content is being inserted into.
 */
export function $insertDataTransferForRichText(
  dataTransfer: DataTransfer,
  selection: RangeSelection | GridSelection,
  editor: LexicalEditor,
): void {

  const lexicalString = dataTransfer.getData('application/x-lexical-editor');


  if (lexicalString) {
    try {

      const payload = JSON.parse(lexicalString);


      if (
        payload.namespace === editor._config.namespace &&
        Array.isArray(payload.nodes)
      ) {

        const nodes = $generateNodesFromSerializedNodes(payload.nodes);
        const cleanedNodes = getCleanedNodes(nodes);


        return $insertGeneratedNodes(editor, cleanedNodes, selection);
      }
    } catch {
      // Fail silently.
    }
  }

  const htmlString = dataTransfer.getData('text/html');

  if (htmlString) {
    try {
      const parser = new DOMParser();
      const dom = parser.parseFromString(htmlString, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      const cleanedNodes = getCleanedNodes(nodes);


      return $insertGeneratedNodes(editor, cleanedNodes, selection);
    } catch {
      // Fail silently.
    }
  }

  // Multi-line plain text in rich text mode pasted as separate paragraphs
  // instead of single paragraph with linebreaks.
  // Webkit-specific: Supports read 'text/uri-list' in clipboard.
  const text =
    dataTransfer.getData('text/plain') || dataTransfer.getData('text/uri-list');
  if (text != null) {
    if ($isRangeSelection(selection)) {
      const parts = text.split(/(\r?\n|\t)/);
      const partsLength = parts.length;
      for (let i = 0; i < partsLength; i++) {
        const part = parts[i];
        if (part === '\n' || part === '\r\n') {
          selection.insertParagraph();
        } else if (part === '\t') {
          selection.insertNodes([$createTabNode()]);
        } else {
          selection.insertText(part);
        }
      }
    } else {
      selection.insertRawText(text);
    }
  }
}
