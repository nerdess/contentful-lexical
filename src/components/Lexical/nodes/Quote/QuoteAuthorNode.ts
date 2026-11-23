import {
  $createParagraphNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  SerializedElementNode,
} from 'lexical';

import { $isQuoteContainerNode } from './QuoteContainerNode';

type SerializedQuoteAuthorNode = SerializedElementNode;

export function $convertFigcaptionElement(_domNode: HTMLElement): DOMConversionOutput | null {
  const node = $createQuoteAuthorNode();
  return {
    node,
  };
}

export class QuoteAuthorNode extends ElementNode {
  static getType(): string {
    return 'quote-author';
  }

  static clone(node: QuoteAuthorNode): QuoteAuthorNode {
    return new QuoteAuthorNode(node.__key);
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('figcaption');
    dom.classList.add('ts-quote-author');

    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      figcaption: (_domNode: HTMLElement) => {
        return {
          conversion: $convertFigcaptionElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('figcaption');
    element.classList.add('ts-quote-author');
    return { element };
  }

  static importJSON(serializedNode: SerializedQuoteAuthorNode): QuoteAuthorNode {
    return $createQuoteAuthorNode().updateFromJSON(serializedNode);
  }

  insertNewAfter(_selection: RangeSelection, restoreSelection = true): ElementNode {
    const paragraph = $createParagraphNode();
    const containerNode = this.getParentOrThrow();
    if ($isQuoteContainerNode(containerNode)) {
      containerNode.insertAfter(paragraph, restoreSelection);
    } else {
      this.insertAfter(paragraph, restoreSelection);
    }
    return paragraph;
  }

  collapseAtStart(): boolean {
    return true;
  }
}

export function $createQuoteAuthorNode(): QuoteAuthorNode {
  return new QuoteAuthorNode();
}

export function $isQuoteAuthorNode(node: LexicalNode | null | undefined): node is QuoteAuthorNode {
  return node instanceof QuoteAuthorNode;
}
