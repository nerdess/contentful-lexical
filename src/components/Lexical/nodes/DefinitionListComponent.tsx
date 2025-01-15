/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './DefinitionList.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {
  $getNodeByKey,
  $isNodeSelection,
  BaseSelection,
  NodeKey,
} from 'lexical';
import * as React from 'react';
import {useRef, useState} from 'react';

import Button from '../../ui/Button';
import { $isDefinitionListNode, createDefinitionListOption, DefinitionListNode, Option, Options } from './DefinitionListNode';

function DefinitionListOptionComponent({
  option,
  index,
  withDefinitionListNode,
}: {
  index: number;
  option: Option;
  withDefinitionListNode: (
    cb: (definitionListNode: DefinitionListNode) => void,
    onSelect?: () => void,
  ) => void;
}): JSX.Element {

  return (
    <div className="DefinitionListNode__optionContainer">
      <button
        className="DefinitionListNode__delete"
        aria-label="Remove"
        onClick={() => {
          withDefinitionListNode((node) => {
            node.deleteOption(option);
          });
        }}
      />
      <div className="DefinitionListNode__optionContainerInner">
        <input
          className="PollNode__optionDT"
          type="text"
          value={option.dt}
          onChange={(e) => {
            const target = e.target;
            const value = target.value;
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            withDefinitionListNode(
              (node) => {
                node.setOptionText(option, value, 'dt');
              },
              () => {
                target.selectionStart = selectionStart;
                target.selectionEnd = selectionEnd;
              },
            );
          }}
          placeholder={`Term ${index + 1}`}
        />
        <textarea
          className="PollNode__optionDD"
          value={option.dd}
          onChange={(e) => {
            const target = e.target;
            const value = target.value;
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            withDefinitionListNode(
              (node) => {
                node.setOptionText(option, value, 'dd');
              },
              () => {
                target.selectionStart = selectionStart;
                target.selectionEnd = selectionEnd;
              },
            );
          }}
          placeholder={`Term definition ${index + 1}`}
        />

      </div>
    </div>
  );
}



export default function DefinitionListComponent({
  options,
  nodeKey,
}: {
  nodeKey: NodeKey;
  options: Options;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const ref = useRef(null);

  const withDefinitionListNode = (
    cb: (node: DefinitionListNode) => void,
    onUpdate?: () => void,
  ): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if ($isDefinitionListNode(node)) {
          cb(node);
        }
      },
      {onUpdate},
    );
  };

  const addOption = () => {
    withDefinitionListNode((node) => {
      node.addOption(createDefinitionListOption());
    });
  };

  const deleteDefinitionList = () => {
    withDefinitionListNode((node) => {
      node.remove();
    });
  }

  const isFocused = $isNodeSelection(selection) && isSelected;


  return (
    <div
      className={`DefinitionListNode__container ${isFocused ? 'focused' : ''}`}
      ref={ref}
    >
      <div className="DefinitionListNode__header">
        <h2 className="DefinitionListNode__heading">
          Definition list
        </h2>
        <button className="DefinitionListNode__delete" onClick={deleteDefinitionList} />
      </div>
      <div className="DefinitionListNode__body">
        {options.map((option, index) => {
          const key = option.uid;
          return (
            <DefinitionListOptionComponent
              key={key}
              withDefinitionListNode={withDefinitionListNode}
              option={option}
              index={index}
            />
          );
        })}
      </div>

      <div className="DefinitionListNode__footer">
          <Button className="DefinitionListNode_button" onClick={addOption} small={true}>
            Add term
          </Button>
      </div>
    </div>
  );
}
