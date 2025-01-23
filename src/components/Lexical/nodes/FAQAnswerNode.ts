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

export type SerializedFAQAnswerNode = Spread<
  {
    //templateColumns: string;
  },
  SerializedElementNode
>;

function $convertFAQAnswerElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {

  /*const styleAttributes = window.getComputedStyle(domNode);
  const templateColumns = styleAttributes.getPropertyValue(
    'grid-template-columns',
  );
  if (templateColumns) {
    const node = $createFAQAnswerNode(templateColumns);
    return {node};
  }*/
  return null;
}

export class FAQAnswerNode extends ElementNode {

  static getType(): string {
    return 'faq-answer';
  }

  static clone(node: FAQAnswerNode): FAQAnswerNode {
    return new FAQAnswerNode(/*node.__templateColumns,*/ node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.setAttribute('itemscope', '');
    dom.setAttribute('itemtype', 'http://schema.org/Answer');
    dom.setAttribute('itemprop', 'acceptedAnswer');

    const answerText = document.createElement('div');
    answerText.setAttribute('itemprop', 'text');

    dom.appendChild(answerText);

    return dom;
  }

  exportDOM(): DOMExportOutput {

    const element = document.createElement('div');
    element.setAttribute('itemscope', '');
    element.setAttribute('itemtype', 'http://schema.org/Answer');
    element.setAttribute('itemprop', 'acceptedAnswer');

    const answerText = document.createElement('div');
    answerText.setAttribute('itemprop', 'text');

    element.appendChild(answerText);

    return {element};
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    /*if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }*/
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
      //.setTemplateColumns(serializedNode.templateColumns);
  }

  /*isShadowRoot(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }*/

  exportJSON(): SerializedFAQAnswerNode {
    return {
      ...super.exportJSON(),
      //templateColumns: this.__templateColumns,
    };
  }

  /*getTemplateColumns(): string {
    return this.getLatest().__templateColumns;
  }*/

  /*setTemplateColumns(templateColumns: string): this {
    const self = this.getWritable();
    self.__templateColumns = templateColumns;
    return self;
  }*/
}

export function $createFAQAnswerNode(
  //templateColumns: string = '',
): FAQAnswerNode {
  return new FAQAnswerNode(/*templateColumns*/);
}

export function $isFAQAnswerNode(
  node: LexicalNode | null | undefined,
): node is FAQAnswerNode {
  return node instanceof FAQAnswerNode;
}
