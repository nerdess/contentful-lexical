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
  const DTs = domNode.querySelectorAll(':scope > dt');
  const DDs = domNode.querySelectorAll(':scope > dd');
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
    console.log('importDOM before dl')
    return {
      dl: () => {
        console.log('importDOM dl')
        return {
          conversion: $convertDefinitionListElement,
          priority: 2,
        };
      }
      /*span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-poll-question')) {
          return null;
        }
        return {
          conversion: $convertDefinitionListElement,
          priority: 2,
        };
      },*/
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('dl');
    for (const option of this.__options) {
      const dt = document.createElement('dt');
      dt.textContent = option.dt;
      element.appendChild(dt);
      const dd = document.createElement('dd');
      dd.textContent = option.dd;
      element.appendChild(dd);
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
