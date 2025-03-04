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

export type SerializedFAQAnswerNodeInner = Spread<
  {
    //templateColumns: string;
  },
  SerializedElementNode
>;

function $convertFAQAnswerElement(
): DOMConversionOutput | null {
  const node = $createFAQAnswerNodeInner();
  return {node};
}

export class FAQAnswerNodeInner extends ElementNode {

  static getType(): string {
    return 'faq-answer-inner';
  }

  static clone(node: FAQAnswerNodeInner): FAQAnswerNodeInner {
    return new FAQAnswerNodeInner( node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div');
    dom.setAttribute('data-lexical-faq-answer-inner', 'true');
    dom.setAttribute('itemprop', 'text');
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-faq-answer-inner', 'true');
    element.setAttribute('itemprop', 'text');
    return {element};
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-faq-answer-inner')) {
          return null;
        }
        return {
          conversion: $convertFAQAnswerElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(json: SerializedFAQAnswerNodeInner): FAQAnswerNodeInner {
    return $createFAQAnswerNodeInner().updateFromJSON(json);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedFAQAnswerNodeInner>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
  }

  exportJSON(): SerializedFAQAnswerNodeInner {
    return {
      ...super.exportJSON(),
    };
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  canInsertTextBefore(): boolean {
    return false;
  }
}

export function $createFAQAnswerNodeInner(
): FAQAnswerNodeInner {
  return new FAQAnswerNodeInner();
}

export function $isFAQAnswerNodeInner(
  node: LexicalNode | null | undefined,
): node is FAQAnswerNodeInner {
  return node instanceof FAQAnswerNodeInner;
}
