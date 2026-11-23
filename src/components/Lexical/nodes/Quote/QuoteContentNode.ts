import { t } from 'i18next';
import {
  $getRoot,
  $getNodeByKey,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  SerializedElementNode,
} from 'lexical';

import { $isQuoteContainerNode } from './QuoteContainerNode';
import './Quote.scss';
import { QuoteStyle } from './types';

type SerializedQuoteContentNode = SerializedElementNode & {
  quoteStyle: QuoteStyle;
};

export function $convertBlockquoteElement(_domNode: HTMLElement): DOMConversionOutput | null {
  const quoteStyle = _domNode.classList.contains('ts-quote-style-high')
    ? 'ts-quote-style-high'
    : 'ts-quote-style-low-high';
  const node = $createQuoteContentNode(quoteStyle);
  return {
    node,
  };
}

export class QuoteContentNode extends ElementNode {
  __quoteStyle: QuoteStyle;

  constructor(quoteStyle: QuoteStyle, key?: string) {
    super(key);
    this.__quoteStyle = quoteStyle;
  }

  static getType(): string {
    return 'quote-content';
  }

  static clone(node: QuoteContentNode): QuoteContentNode {
    return new QuoteContentNode(node.__quoteStyle, node.__key);
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('blockquote');
    dom.classList.add('ts-quote-content', this.__quoteStyle);

    const nodeKey = this.__key;
    if (nodeKey) {
      dom.setAttribute('data-content-key', nodeKey);
    }

    const deleteButtonContainer = document.createElement('div');
    deleteButtonContainer.classList.add('quote-delete-button');
    deleteButtonContainer.contentEditable = 'false';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('f36-button', 'f36-button--negative', 'f36-button--small');

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('f36-button__icon', 'f36-button__icon--left');
    iconSpan.style.marginRight = '0.5rem';
    iconSpan.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>';

    const textSpan = document.createElement('span');
    textSpan.classList.add('f36-button__text');
    textSpan.textContent = t('editor.citation.delete');

    deleteButton.appendChild(iconSpan);
    deleteButton.appendChild(textSpan);
    deleteButtonContainer.appendChild(deleteButton);
    dom.appendChild(deleteButtonContainer);

    deleteButton.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      if (_editor) {
        _editor.update(() => {
          const thisNode = $getNodeByKey(nodeKey);
          if (thisNode) {
            const parent = thisNode.getParent();
            if (parent && $isQuoteContainerNode(parent)) {
              parent.remove();
            } else {
              const root = $getRoot();
              root.getChildren().forEach(node => {
                if ($isQuoteContainerNode(node)) {
                  node.getChildren().forEach(child => {
                    if (child.__key === nodeKey) {
                      node.remove();
                      return;
                    }
                  });
                }
              });
            }
          }
        });
      }
    });

    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: (_domNode: HTMLElement) => {
        return {
          conversion: $convertBlockquoteElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('blockquote');
    element.classList.add('ts-quote-content', this.__quoteStyle);
    return { element };
  }

  static importJSON(serializedNode: SerializedQuoteContentNode): QuoteContentNode {
    const { quoteStyle } = serializedNode;
    return $createQuoteContentNode(quoteStyle).updateFromJSON(serializedNode);
  }

  isShadowRoot(): boolean {
    return false;
  }
}

export function $createQuoteContentNode(quoteStyle: QuoteStyle): QuoteContentNode {
  return new QuoteContentNode(quoteStyle);
}

export function $isQuoteContentNode(
  node: LexicalNode | null | undefined
): node is QuoteContentNode {
  return node instanceof QuoteContentNode;
}
