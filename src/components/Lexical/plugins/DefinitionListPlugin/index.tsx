/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  $insertNodeToNearestRoot,
  $wrapNodeInElement} from '@lexical/utils';
import {
  $createParagraphNode,
  $getRoot,
  $insertNodes,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from 'lexical';
import {useEffect, useState} from 'react';
import * as React from 'react';

import {
  $createDefinitionListNode,
  DefinitionListNode,
  Options
} from '../../nodes/DefinitionListNode';
import { $customInsertNodeToNearestRoot } from './customInsertNodeToNearestRoot';

function createUID(): string {
	return Math.random()
	  .toString(36)
	  .replace(/[^a-z]+/g, '')
	  .substr(0, 5);
} 



export const INSERT_DEFINITIONLIST_COMMAND: LexicalCommand<undefined> = createCommand(
  'INSERT_DEFINITIONLIST_COMMAND',
);
export default function DefinitionListPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([DefinitionListNode])) {
      throw new Error('DefinitionListNode not registered on editor');
    }

    return editor.registerCommand<undefined>(
      INSERT_DEFINITIONLIST_COMMAND,
      () => {
        editor.update(() => {
          const DLNode = $createDefinitionListNode([{
            dd: '',
            dt: '',
            uid: createUID()
          }]);
          //$customInsertNodeToNearestRoot(DLNode);
          $insertNodeToNearestRoot(DLNode);
          $setSelection(null);
          return true;
        });
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);
  return null;
}

