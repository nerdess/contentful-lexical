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
} from 'lexical';

import {ElementNode} from 'lexical';

export type SerializedFAQContainerNode = SerializedElementNode;

function $convertFAQContainerElement(): DOMConversionOutput | null {
  const node = $createFAQContainerNode();
  return {node};
}

export class FAQContainerNode extends ElementNode {

  static getType(): string {
    return 'faq-container';
  }

  static clone(node: FAQContainerNode): FAQContainerNode {
    return new FAQContainerNode(node.__key);
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('div');
    dom.classList.add('ts-faq-container');
    dom.setAttribute('data-lexical-faq-container', 'true');
    dom.setAttribute('itemscope', '');
    dom.setAttribute('itemtype', 'https://schema.org/FAQPage');
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.classList.add('ts-faq-container');
    element.setAttribute('data-lexical-faq-container', 'true');
    element.setAttribute('itemscope', '');
    element.setAttribute('itemtype', 'https://schema.org/FAQPage');
    return {element};
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        console.log('domNodeContainer', domNode, domNode.hasAttribute('data-lexical-faq-container'));
        if (!domNode.hasAttribute('data-lexical-faq-container')) {
          return null;
        }
        return {
          conversion: $convertFAQContainerElement,
          priority: 2,
        };
      },
    };
  }

  static importJSON(json: SerializedFAQContainerNode): FAQContainerNode {
    return $createFAQContainerNode().updateFromJSON(json);
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedFAQContainerNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
  }

  isShadowRoot(): boolean {
    return true;
  }

  exportJSON(): SerializedFAQContainerNode {
    return {
      ...super.exportJSON()
    };
  }
}

export function $createFAQContainerNode(
): FAQContainerNode {
  return new FAQContainerNode();
}

export function $isFAQContainerNode(
  node: LexicalNode | null | undefined,
): node is FAQContainerNode {
  return node instanceof FAQContainerNode;
}
