import {
  $isElementNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
  Spread,
} from 'lexical';

type SerializedQuoteContainerNode = Spread<{ version: number }, SerializedElementNode>;

export function $convertFigureElement(_domNode: HTMLElement): DOMConversionOutput | null {
  const node = $createQuoteContainerNode();
  return {
    node,
  };
}

export class QuoteContainerNode extends ElementNode {
  constructor(key?: NodeKey) {
    super(key);
  }

  static getType(): string {
    return 'quote-container';
  }

  static clone(node: QuoteContainerNode): QuoteContainerNode {
    return new QuoteContainerNode(node.__key);
  }

  isShadowRoot(): boolean {
    return true;
  }

  collapseAtStart(_selection: RangeSelection): boolean {
    const nodesToInsert: LexicalNode[] = [];
    for (const child of this.getChildren()) {
      if ($isElementNode(child)) {
        nodesToInsert.push(...child.getChildren());
      }
    }

    const firstChild = nodesToInsert[0];
    if (firstChild) {
      const parent = this.getParentOrThrow();

      for (const node of nodesToInsert) {
        if (parent) parent.insertBefore(node);
      }

      this.remove();

      firstChild.selectStart();
    } else {
      this.remove();
    }
    return true;
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('figure');
    dom.classList.add('ts-quote', 'ts-quote-container');

    return dom;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      figure: (_domNode: HTMLElement) => {
        return {
          conversion: $convertFigureElement,
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('figure');
    element.classList.add('ts-quote', 'ts-quote-container');
    return { element };
  }

  static importJSON(serializedNode: SerializedQuoteContainerNode): QuoteContainerNode {
    return $createQuoteContainerNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedQuoteContainerNode {
    return {
      ...super.exportJSON(),
      type: 'quote-container',
      version: 1,
    };
  }
}

export function $createQuoteContainerNode(): QuoteContainerNode {
  return new QuoteContainerNode();
}

export function $isQuoteContainerNode(
  node: LexicalNode | null | undefined
): node is QuoteContainerNode {
  return node instanceof QuoteContainerNode;
}
