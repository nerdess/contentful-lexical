/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {useLayoutEffect} from 'react';
import type {
    EditorState,
    LexicalEditor
} from 'lexical';
import { 
    $getSelection,
    $isRangeSelection,
    $getRoot
 } from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { mapToObj } from '../helper';


/*const mapToObj = (map: Map<number, object>): => {
    const obj = {}
    for (let [k,v] of map)
      obj[k] = v
    return obj
  }*/


export function OnChangePlugin({
  ignoreHistoryMergeTagChange = true,
  ignoreSelectionChange = false,
  ignoreNonChanges = false,
  onChange,
}: {
  ignoreHistoryMergeTagChange?: boolean;
  ignoreSelectionChange?: boolean;
  ignoreNonChanges?: boolean;
  onChange: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>,
  ) => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (onChange) {
      return editor.registerUpdateListener(
        ({editorState, dirtyElements, dirtyLeaves, prevEditorState, tags}) => {

            if (ignoreNonChanges) {

                const current = JSON.stringify(mapToObj(editorState._nodeMap));
                const prev = JSON.stringify(mapToObj(prevEditorState._nodeMap));
                if (current === prev) return;
            }

            if (
                (ignoreSelectionChange &&
                dirtyElements.size === 0 &&
                dirtyLeaves.size === 0) ||
                (ignoreHistoryMergeTagChange && tags.has('history-merge')) ||
                prevEditorState.isEmpty()
            ) {
                return;
            }

          onChange(editorState, editor, tags);
        },
      );
    }
  }, [editor, ignoreHistoryMergeTagChange, ignoreSelectionChange, ignoreNonChanges, onChange]);

  return null;
}
