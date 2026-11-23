import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import {
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  NodeKey,
} from 'lexical';
import { useState, useEffect } from 'react';

import { $isQuoteContainerNode, QuoteContainerNode } from './QuoteContainerNode';

type QuoteComponentProps = {
  nodeKey: NodeKey;
};

export default function QuoteComponent({ nodeKey }: QuoteComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  useEffect(
    function trackSelectionState() {
      const element = editor.getElementByKey(nodeKey);
      if (element) {
        if (isSelected) {
          element.classList.add('selected-quote');
        } else {
          element.classList.remove('selected-quote');
        }
      }
    },
    [editor, isSelected, nodeKey]
  );

  useEffect(
    function registerClickHandler() {
      return editor.registerCommand(
        CLICK_COMMAND,
        payload => {
          if (
            payload.target instanceof HTMLElement &&
            editor.getElementByKey(nodeKey)?.contains(payload.target)
          ) {
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      );
    },
    [editor, nodeKey, setSelected]
  );

  useEffect(
    function registerEscapeHandler() {
      return editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isSelected) {
            clearSelection();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      );
    },
    [clearSelection, editor, isSelected]
  );

  return (
    <div className='quote-container-wrapper'>
      <div className='quote-component-inner'>
        <QuoteContentRender nodeKey={nodeKey} />
      </div>
    </div>
  );
}

function QuoteContentRender({ nodeKey }: { nodeKey: NodeKey }): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [content, setContent] = useState<HTMLElement | null>(null);

  useEffect(
    function renderQuoteContent() {
      editor.getEditorState().read(() => {
        const quoteNode = $getNodeByKey(nodeKey);
        if ($isQuoteContainerNode(quoteNode)) {
          const contentNode = quoteNode.getFirstChild();
          if (contentNode) {
            setContent(editor.getElementByKey(contentNode.getKey()));
          }
        }
      });

      return editor.registerMutationListener(QuoteContainerNode, mutations => {
        editor.getEditorState().read(() => {
          for (const [mutationKey, mutation] of mutations) {
            if (mutationKey === nodeKey && (mutation === 'created' || mutation === 'updated')) {
              const quoteNode = $getNodeByKey(nodeKey);
              if ($isQuoteContainerNode(quoteNode)) {
                const contentNode = quoteNode.getFirstChild();
                if (contentNode) {
                  setContent(editor.getElementByKey(contentNode.getKey()));
                }
              }
            }
          }
        });
      });
    },
    [editor, nodeKey]
  );

  return content !== null ? <>{content.childNodes}</> : null;
}
