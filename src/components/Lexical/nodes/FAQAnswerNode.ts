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
  LexicalNode,
  LexicalUpdateJSON,
  SerializedElementNode,
  Spread,
} from 'lexical';

import {ElementNode} from 'lexical';

export type SerializedFAQAnswerNode = Spread<
  {
    //templateColumns: string;
  },
  SerializedElementNode
>;

function $convertFAQAnswerElement(
): DOMConversionOutput | null {
  const node = $createFAQAnswerNode();
  return {node};
}

export class FAQAnswerNode extends ElementNode {

  static getType(): string {
    return 'faq-answer';
  }

  static clone(node: FAQAnswerNode): FAQAnswerNode {
    return new FAQAnswerNode( node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div');
    dom.setAttribute('data-lexical-faq-answer', 'true');
    dom.setAttribute('itemscope', '');
    dom.setAttribute('itemtype', 'http://schema.org/Answer');
    dom.setAttribute('itemprop', 'acceptedAnswer');
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-faq-answer', 'true');
    element.setAttribute('itemscope', '');
    element.setAttribute('itemtype', 'http://schema.org/Answer');
    element.setAttribute('itemprop', 'acceptedAnswer');
    return {element};
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-faq-answer')) {
          return null;
        }
        return {
          conversion: $convertFAQAnswerElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(json: SerializedFAQAnswerNode): FAQAnswerNode {
    return $createFAQAnswerNode().updateFromJSON(json);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedFAQAnswerNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
  }

  exportJSON(): SerializedFAQAnswerNode {
    return {
      ...super.exportJSON(),
    };
  }
}

export function $createFAQAnswerNode(
): FAQAnswerNode {
  return new FAQAnswerNode();
}

export function $isFAQAnswerNode(
  node: LexicalNode | null | undefined,
): node is FAQAnswerNode {
  return node instanceof FAQAnswerNode;
}
