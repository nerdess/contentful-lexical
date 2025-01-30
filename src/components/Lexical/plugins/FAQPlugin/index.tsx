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
	$insertNodes,
	$setSelection,
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
import { $isRootOrShadowRoot } from 'lexical';
import { $wrapNodeInElement } from '@lexical/utils';

export const INSERT_FAQ_COMMAND: LexicalCommand<number> = createCommand<number>();

export const INSERT_FAQ_ITEM_COMMAND: LexicalCommand<undefined> = createCommand(
	'INSERT_FAQ_ITEM_COMMAND'
);

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
                $createFAQQuestionNode()
              );
              item.append(
                $createFAQAnswerNode().append($createParagraphNode())
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
      ),
      editor.registerCommand(
        INSERT_FAQ_ITEM_COMMAND,
        () => {
          editor.update(() => {
            const FAQItemNode = $createFAQItemNode();
            const FAQQuestionNode = $createFAQQuestionNode();
            const FAQAnswerNode = $createFAQAnswerNode().append($createParagraphNode());
            FAQItemNode.append(FAQQuestionNode);
            FAQItemNode.append(FAQAnswerNode);
            console.log(FAQItemNode);
            $insertNodes([FAQItemNode]);
            FAQQuestionNode.selectStart();
            //return true;
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

	return null;
}
