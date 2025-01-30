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
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

import {addClassNamesToElement} from '@lexical/utils';
import {ElementNode} from 'lexical';

export type SerializedFAQQuestionNode = Spread<
  {
    //templateColumns: string;
  },
  SerializedElementNode
>;

function $convertFAQQuestionElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {

  /*const styleAttributes = window.getComputedStyle(domNode);
  const templateColumns = styleAttributes.getPropertyValue(
    'grid-template-columns',
  );
  if (templateColumns) {
    const node = $createFAQQuestionNode(templateColumns);
    return {node};
  }*/
  return null;
}

export class FAQQuestionNode extends ElementNode {

  static getType(): string {
    return 'faq-question';
  }

  static clone(node: FAQQuestionNode): FAQQuestionNode {
    return new FAQQuestionNode(/*node.__templateColumns,*/ node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('h3');
    dom.setAttribute('data-lexical-faq-question', 'true');
    dom.setAttribute('itemprop', 'name');

    return dom;
  }

  exportDOM(): DOMExportOutput {

    const element = document.createElement('h3');
    element.setAttribute('itemprop', 'name');

    return {element};
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      h3: (domNode: HTMLElement) => {
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

}

export function $createFAQQuestionNode(
  //templateColumns: string = '',
): FAQQuestionNode {
  return new FAQQuestionNode(/*templateColumns*/);
}

export function $isFAQQuestionNode(
  node: LexicalNode | null | undefined,
): node is FAQQuestionNode {
  return node instanceof FAQQuestionNode;
}
