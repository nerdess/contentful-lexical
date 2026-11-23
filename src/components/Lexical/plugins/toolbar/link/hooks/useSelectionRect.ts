import { $isLinkNode } from '@lexical/link';
import { $findMatchingParent } from '@lexical/utils';
import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical';
import { useCallback, useState } from 'react';

import { getSelectedNode } from '../../../utils/getSelectedNode';

/**
 * Custom hook for managing text selection rectangle
 */
export function useSelectionRect(editor: LexicalEditor) {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const updateSelectionRect = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      setSelectionRect(null);
      return;
    }

    const nativeSelection = window.getSelection();
    if (!nativeSelection || nativeSelection.rangeCount === 0) {
      setSelectionRect(null);
      return;
    }

    let rect: DOMRect | undefined;
    const range = nativeSelection.getRangeAt(0);
    rect = range.getBoundingClientRect();

    if (!rect || rect.width === 0) {
      rect = nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
    }

    if ((!rect || rect.width === 0) && $isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkNode = $isLinkNode(node) ? node : $findMatchingParent(node, $isLinkNode);

      if (linkNode) {
        const element = editor.getElementByKey(linkNode.getKey());
        if (element) {
          rect = element.getBoundingClientRect();
        }
      }
    }

    setSelectionRect(rect || null);
  }, [editor]);

  return { selectionRect, updateSelectionRect };
}
