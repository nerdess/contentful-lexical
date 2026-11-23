import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ParagraphNode, TextNode } from 'lexical';

import theme from '../../themes/defaultTheme';

import { CustomLinkNode } from './nodes/CustomLinkNode';
import { CustomParagraphNode } from './nodes/CustomParagraphNode';
import { CustomTextNode } from './nodes/CustomTextNode';
import { FAQAnswerNode } from './nodes/FAQAnswerNode';
import { FAQAnswerNodeInner } from './nodes/FAQAnswerNodeInner';
import { FAQContainerNode } from './nodes/FAQContainerNode';
import { FAQItemNode } from './nodes/FAQItemNode';
import { FAQQuestionNode } from './nodes/FAQQuestionNode';
import { ImageNode } from './nodes/ImageNode';
import { QuoteAuthorNode } from './nodes/Quote/QuoteAuthorNode';
import { QuoteContainerNode } from './nodes/Quote/QuoteContainerNode';
import { QuoteContentNode } from './nodes/Quote/QuoteContentNode';

export const editorConfig: InitialConfigType = {
  namespace: 'Contentful',
  theme,
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    AutoLinkNode,
    ImageNode,
    QuoteNode,
    //DefinitionListNode,
    QuoteContainerNode,
    QuoteContentNode,
    QuoteAuthorNode,
    FAQContainerNode,
    FAQItemNode,
    FAQQuestionNode,
    FAQAnswerNode,
    FAQAnswerNodeInner,
    //CustomHeadingNode,
    /*{
			replace: HeadingNode,
			with: (node) => {
				return new CustomHeadingNode();
			},
		},*/
    CustomParagraphNode,
    {
      replace: ParagraphNode,
      with: () => {
        return new CustomParagraphNode();
      },
      withKlass: CustomParagraphNode,
    },
    CustomTextNode,
    {
      replace: TextNode,
      with: (node: TextNode) => {
        return new CustomTextNode(node.__text);
      },
      withKlass: CustomTextNode,
    },
    CustomLinkNode,
    {
      replace: LinkNode,
      with: (node: LinkNode) => {
        return new CustomLinkNode(node.getURL(), {
          target: node.getTarget(),
          rel: node.getRel(),
          title: node.getTitle(),
        });
      },
      withKlass: CustomLinkNode,
    },
  ],
};
