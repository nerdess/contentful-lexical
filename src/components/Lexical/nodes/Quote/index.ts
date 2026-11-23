import './Quote.scss';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

import { $createQuoteAuthorNode, $isQuoteAuthorNode, QuoteAuthorNode } from './QuoteAuthorNode';
import {
  $createQuoteContainerNode,
  $isQuoteContainerNode,
  QuoteContainerNode,
} from './QuoteContainerNode';
import { $createQuoteContentNode, $isQuoteContentNode, QuoteContentNode } from './QuoteContentNode';
import { QuoteStyle } from './types';

// NOTE: command to insert a new quote with optional text and author
export const INSERT_QUOTE_COMMAND = createCommand<{
  quoteText: string;
  authorText: string;
  quoteStyle: QuoteStyle;
}>('INSERT_QUOTE_COMMAND');

// NOTE: command to toggle the quote modal, used for editing existing quotes
export const TOGGLE_QUOTE_MODAL_COMMAND = createCommand<{
  nodeKey?: string;
  quoteText?: string;
  authorText?: string;
}>('TOGGLE_QUOTE_MODAL_COMMAND');

export const DELETE_QUOTE_COMMAND = createCommand<{
  nodeKey: string;
}>('DELETE_QUOTE_COMMAND');

export default function QuotePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // NOTE: throw error if required nodes are not registered
    if (!editor.hasNodes([QuoteContainerNode, QuoteContentNode, QuoteAuthorNode])) {
      throw new Error(
        'QuotePlugin: QuoteContainerNode, QuoteContentNode, or QuoteAuthorNode not registered on editor'
      );
    }

    // NOTE: handles escaping from the top of a quote using up/left arrow
    const $onEscapeUp = () => {
      const selection = $getSelection();
      if (
        $isRangeSelection(selection) &&
        selection.isCollapsed() &&
        selection.anchor.offset === 0
      ) {
        const container = $findMatchingParent(selection.anchor.getNode(), $isQuoteContainerNode);

        if ($isQuoteContainerNode(container)) {
          const parent = container.getParent();
          if (
            parent !== null &&
            parent.getFirstChild() === container &&
            selection.anchor.key === container.getFirstDescendant()?.getKey()
          ) {
            container.insertBefore($createParagraphNode());
            return true;
          }
        }
      }

      return false;
    };

    // NOTE: handles escaping from the bottom of a quote using down/right arrow
    const $onEscapeDown = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const container = $findMatchingParent(selection.anchor.getNode(), $isQuoteContainerNode);

        if ($isQuoteContainerNode(container)) {
          const parent = container.getParent();
          if (parent !== null && parent.getLastChild() === container) {
            const authorNode = container.getLastDescendant();

            if (
              authorNode !== null &&
              selection.anchor.key === authorNode.getKey() &&
              selection.anchor.offset === authorNode.getTextContentSize()
            ) {
              container.insertAfter($createParagraphNode());
              return true;
            }
          }
        }
      }

      return false;
    };

    // NOTE: handles the Enter key press within a quote
    const $handleEnterInQuote = () => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return false;
      }

      const anchorNode = selection.anchor.getNode();
      const quoteContainer = $findMatchingParent(anchorNode, $isQuoteContainerNode);

      if (!quoteContainer) {
        return false;
      }

      // NOTE: if we're in a quote content node, create a new paragraph inside the content
      if ($findMatchingParent(anchorNode, $isQuoteContentNode)) {
        const paragraphParent = $findMatchingParent(
          anchorNode,
          node => node.getType() === 'paragraph'
        );

        if (!paragraphParent) {
          return false; // NOTE: should always be inside a paragraph within quote content
        }

        const newParagraph = $createParagraphNode();

        // NOTE: if we're inside a text node and there's text after cursor position
        if (
          $isTextNode(anchorNode) &&
          selection.isCollapsed() &&
          selection.anchor.offset < anchorNode.getTextContentSize()
        ) {
          // NOTE: use the splitText method on the text node instance
          const [, afterTextNode] = anchorNode.splitText(selection.anchor.offset);

          if (afterTextNode) {
            // NOTE: append the node containing text after the cursor to the new paragraph
            newParagraph.append(afterTextNode);
          }
        }

        // NOTE: insert the new paragraph after the current one
        paragraphParent.insertAfter(newParagraph);
        newParagraph.selectStart(); // NOTE: select the beginning of the new paragraph
        return true;
      }

      // NOTE: if we're in an author node and at the end, create a new paragraph after the quote container
      if ($findMatchingParent(anchorNode, $isQuoteAuthorNode)) {
        const isAtEnd = selection.anchor.offset === anchorNode.getTextContentSize();

        if (isAtEnd) {
          const newParagraph = $createParagraphNode();
          quoteContainer.insertAfter(newParagraph);
          newParagraph.selectStart(); // NOTE: select the beginning of the new paragraph
          return true;
        }
      }

      // NOTE: if none of the above conditions are met, allow Lexical's default Enter key handling
      return false;
    };

    return mergeRegister(
      // NOTE: structure enforcing transformers for each node type. In case nesting structure is not
      // "Container > Content + Author" it'll unwrap nodes and convert it back
      // to regular content.
      editor.registerNodeTransform(QuoteContentNode, node => {
        const parent = node.getParent();
        if (!$isQuoteContainerNode(parent)) {
          const children = node.getChildren();
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }),

      editor.registerNodeTransform(QuoteAuthorNode, node => {
        const parent = node.getParent();
        if (!$isQuoteContainerNode(parent)) {
          node.replace($createParagraphNode().append(...node.getChildren()));
          return;
        }
      }),

      editor.registerNodeTransform(QuoteContainerNode, node => {
        const children = node.getChildren();
        if (
          children.length !== 2 ||
          !$isQuoteContentNode(children[0]) ||
          !$isQuoteAuthorNode(children[1])
        ) {
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }),

      // NOTE: handle Enter key in quotes
      editor.registerCommand(KEY_ENTER_COMMAND, $handleEnterInQuote, COMMAND_PRIORITY_HIGH),

      // NOTE: when quote is the last child pressing down/right arrow will insert paragraph
      // below it to allow adding more content
      editor.registerCommand(KEY_ARROW_DOWN_COMMAND, $onEscapeDown, COMMAND_PRIORITY_LOW),

      editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, $onEscapeDown, COMMAND_PRIORITY_LOW),

      // NOTE: when quote is the first child pressing up/left arrow will insert paragraph
      // above it to allow adding more content
      editor.registerCommand(KEY_ARROW_UP_COMMAND, $onEscapeUp, COMMAND_PRIORITY_LOW),

      editor.registerCommand(KEY_ARROW_LEFT_COMMAND, $onEscapeUp, COMMAND_PRIORITY_LOW),

      // NOTE: register the command to insert a new quote
      editor.registerCommand(
        INSERT_QUOTE_COMMAND,
        ({ quoteText, authorText, quoteStyle }) => {
          editor.update(() => {
            const quoteContainer = $createQuoteContainerNode();
            const quoteContent = $createQuoteContentNode(quoteStyle);
            const quoteAuthor = $createQuoteAuthorNode();

            // NOTE: create quote content with text if provided
            if (quoteText) {
              const quoteTextNode = $createTextNode(quoteText);
              quoteContent.append(quoteTextNode);
            }

            // NOTE: create author with text if provided
            if (authorText) {
              const authorTextNode = $createTextNode(authorText);
              quoteAuthor.append(authorTextNode);
            }

            // NOTE: assemble the full quote structure
            quoteContainer.append(quoteContent, quoteAuthor);

            // NOTE: insert at the nearest root (usually the editor root)
            $insertNodeToNearestRoot(quoteContainer);
          });
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),

      // NOTE: register command to show the edit modal for an existing quote
      editor.registerCommand(
        TOGGLE_QUOTE_MODAL_COMMAND,
        payload => {
          // NOTE: keep the payload object for potential future use
          const { nodeKey } = payload;
          if (nodeKey) {
            // NOTE: this command is primarily handled by the QuoteComponent to show the edit modal
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),

      editor.registerCommand(
        DELETE_QUOTE_COMMAND,
        ({ nodeKey }) => {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isQuoteContainerNode(node)) {
              node.remove();
            }
          });
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
