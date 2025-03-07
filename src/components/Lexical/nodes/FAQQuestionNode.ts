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

export type SerializedFAQQuestionNode = Spread<
  {
    //templateColumns: string;
  },
  SerializedElementNode
>;

function $convertFAQQuestionElement(): DOMConversionOutput | null {
  const node = $createFAQQuestionNode();
  return {node};
}

export class FAQQuestionNode extends ElementNode {

  static getType(): string {
    return 'faq-question';
  }

  static clone(node: FAQQuestionNode): FAQQuestionNode {
    return new FAQQuestionNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('h2');
    dom.setAttribute('data-lexical-faq-question', 'true');
    dom.setAttribute('itemprop', 'name');
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('h2');
    element.setAttribute('data-lexical-faq-question', 'true');
    element.setAttribute('itemprop', 'name');
    return {element};
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      h2: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-faq-question')) {
          return null;
        }
        return {
          conversion: $convertFAQQuestionElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(json: SerializedFAQQuestionNode): FAQQuestionNode {
    return $createFAQQuestionNode().updateFromJSON(json);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedFAQQuestionNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
  }

  exportJSON(): SerializedFAQQuestionNode {
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

export function $createFAQQuestionNode(
): FAQQuestionNode {
  return new FAQQuestionNode();
}

export function $isFAQQuestionNode(
  node: LexicalNode | null | undefined,
): node is FAQQuestionNode {
  return node instanceof FAQQuestionNode;
}
