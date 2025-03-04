/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
	COMMAND_PRIORITY_EDITOR,
	createCommand,
	LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import {
	$createFAQContainerNode,
	FAQContainerNode,
} from '../../nodes/FAQContainerNode';
import { $createFAQItemNode, FAQItemNode } from '../../nodes/FAQItemNode';
import { $createFAQQuestionNode } from '../../nodes/FAQQuestionNode';
import { $createFAQAnswerNode } from '../../nodes/FAQAnswerNode';
import { $createFAQAnswerNodeInner } from '../../nodes/FAQAnswerNodeInner';

export const INSERT_FAQ_COMMAND: LexicalCommand<number> = createCommand<number>();


export default function FAQPlugin(): JSX.Element | null {
	const [editor] = useLexicalComposerContext();


  useEffect(() => {
    if (!editor.hasNodes([FAQContainerNode, FAQItemNode])) {
      throw new Error(
        'FAQPlugin: FAQContainerNode, or FAQItemNode not registered on editor',
      );
    }

    return mergeRegister(
      // When layout is the last child pressing down/right arrow will insert paragraph
      // below it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if trailing paragraph is accidentally deleted
      editor.registerCommand(
        INSERT_FAQ_COMMAND,
        (count) => {
          editor.update(() => {
            const container = $createFAQContainerNode();

            for (let i = 0; i < count; i++) {

              const item = $createFAQItemNode();

              item.append(
                $createFAQQuestionNode().append($createParagraphNode())
              );
              item.append(
                $createFAQAnswerNode().append($createFAQAnswerNodeInner().append($createParagraphNode()))
              );

              container.append(item);
            }

            $insertNodeToNearestRoot(container);
            container.selectStart();
            //return true;
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      )
    );
  }, [editor]);

	return null;
}
