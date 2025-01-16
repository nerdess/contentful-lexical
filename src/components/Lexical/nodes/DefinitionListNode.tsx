/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as React from 'react';
import {Suspense} from 'react';

export type Options = Option[];
export type Option = Readonly<{
    uid: string;
    dt: string;
    dd: string;
}>;

const DefinitionListComponent = React.lazy(() => import('./DefinitionListComponent'));

function createUID(): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5);
}

export function createDefinitionListOption(dt = '', dd = ''): Option {
  return {
    dd,
    dt,
    uid: createUID()
  };
}

export function createDefinitionListItem(dt = '', dd = ''): Option {
    return {
        dd,
        dt,
        uid: createUID()
    };
  }

function cloneOption(
  option: Option,
  text: string,
  type: 'dt' | 'dd'
): Option {
  return {
    ...option,
    [type]: text
  };
}

export type SerializedDefinitionListNode = Spread<
  {
    options: Options;
  },
  SerializedLexicalNode
>;

function $convertDefinitionListElement(domNode: HTMLElement): DOMConversionOutput | null {
  
  const DTs = domNode.querySelectorAll(':scope h3');
  const DDs = domNode.querySelectorAll(':scope p');
  const options = [] as Options;

  DTs.forEach((dt, i) => {
    options.push({
      dt: dt.textContent || '',
      dd: DDs[i].textContent || '',
      uid: createUID()
    });
  });

  const node = $createDefinitionListNode(options);

  return {node};

  /*const options = domNode.getAttribute('data-lexical-poll-options');
  if (options !== null) {
    const node = $createDefinitionListNode(JSON.parse(options));
    return {node};
  }*/
  //return null;
}

export class DefinitionListNode extends DecoratorNode<JSX.Element> {
  __options: Options;

  static getType(): string {
    return 'definition-list';
  }

  static clone(node: DefinitionListNode): DefinitionListNode {
    return new DefinitionListNode(node.__options, node.__key);
  }

  static importJSON(serializedNode: SerializedDefinitionListNode): DefinitionListNode {
    return $createDefinitionListNode(
      serializedNode.options,
    ).updateFromJSON(serializedNode);
  }

  constructor( options: Options = [], key?: NodeKey) {
    super(key);
    this.__options = options;
  }

  exportJSON(): SerializedDefinitionListNode {
    return {
      ...super.exportJSON(),
      options: this.__options
    };
  }

  addOption(option: Option): void {
    const self = this.getWritable();
    const options = Array.from(self.__options);
    options.push(option);
    self.__options = options;
  }

  deleteOption(option: Option): void {
    const self = this.getWritable();
    const options = Array.from(self.__options);
    const index = options.indexOf(option);
    options.splice(index, 1);
    self.__options = options;
  }

  setOptionText(option: Option, text: string, type: 'dt' | 'dd'): void {
    const self = this.getWritable();
    const clonedOption = cloneOption(option, text, type);
    const options = Array.from(self.__options);
    const index = options.indexOf(option);
    options[index] = clonedOption;
    self.__options = options;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: () => {
        return {
          conversion: $convertDefinitionListElement,
          priority: 2,
        };
      }
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('itemscope','');
    element.setAttribute('itemtype','https://schema.org/FAQPage');

    for (const option of this.__options) {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('itemscope','');
      wrapper.setAttribute('itemtype','https://schema.org/Question');
      wrapper.setAttribute('itemprop','mainEntity');

      const question = document.createElement('h3');
      question.setAttribute('itemprop','name');
      question.textContent = option.dt;

      const answerWrapper = document.createElement('div');
      answerWrapper.setAttribute('itemscope','');
      answerWrapper.setAttribute('itemtype','http://schema.org/Answer');
      answerWrapper.setAttribute('itemprop','acceptedAnswer');

      const answer = document.createElement('p');
      answer.setAttribute('itemprop','text');
      answer.textContent = option.dd;

      answerWrapper.appendChild(answer);

      wrapper.appendChild(question);
      wrapper.appendChild(answerWrapper);

      element.appendChild(wrapper);
    }
    
    return {element};
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('div');
    elem.style.display = 'inline-block';
    elem.style.width = '100%';
    return elem;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <DefinitionListComponent
          options={this.__options}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

export function $createDefinitionListNode(options?: Options): DefinitionListNode {
  return new DefinitionListNode(options);
}

export function $isDefinitionListNode(
  node: LexicalNode | null | undefined,
): node is DefinitionListNode {
  return node instanceof DefinitionListNode;
}
