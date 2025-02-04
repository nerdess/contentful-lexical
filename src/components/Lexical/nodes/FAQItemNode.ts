/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  LexicalUpdateJSON,
  SerializedElementNode,
  Spread,
} from 'lexical';

import {ElementNode} from 'lexical';

export type SerializedFAQItemNode = Spread<
  {
    //templateColumns: string;
  },
  SerializedElementNode
>;

function $convertFAQItemElement(): DOMConversionOutput | null {
  const node = $createFAQItemNode();
  return {node};
}

export class FAQItemNode extends ElementNode {

  static getType(): string {
    return 'faq-item';
  }

  static clone(node: FAQItemNode): FAQItemNode {
    return new FAQItemNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.setAttribute('data-lexical-faq-item', 'true');
    dom.setAttribute('itemscope', '');
    dom.setAttribute('itemtype', 'https://schema.org/Question');
    dom.setAttribute('itemprop', 'mainEntity');
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-faq-item', 'true');
    element.setAttribute('itemscope', '');
    element.setAttribute('itemtype', 'https://schema.org/Question');
    element.setAttribute('itemprop', 'mainEntity');

    return {element};
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-faq-item')) {
          return null;
        }
        return {
          conversion: $convertFAQItemElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(json: SerializedFAQItemNode): FAQItemNode {
    return $createFAQItemNode().updateFromJSON(json);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedFAQItemNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
  }
  exportJSON(): SerializedFAQItemNode {
    return {
      ...super.exportJSON()
    };
  }
}

export function $createFAQItemNode(
): FAQItemNode {
  return new FAQItemNode();
}

export function $isFAQItemNode(
  node: LexicalNode | null | undefined,
): node is FAQItemNode {
  return node instanceof FAQItemNode;
}
