/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {LexicalEditor} from 'lexical';
import {useState} from 'react';
import { FormControl, TextInput } from '@contentful/f36-components';
import { INSERT_FAQ_COMMAND } from '.';
import Button from '../../../ui/Button';

export default function InsertFAQDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
    
  const [value, setValue] = useState<string>('1');

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_FAQ_COMMAND, parseInt(value));
    onClose();
  };

  return (
    <>
    <FormControl>
        <FormControl.Label>
           Number of questions
        </FormControl.Label>
        <TextInput
            value={value.toString()}
            type='number'
            onChange={(e) => setValue(e.target.value)}
        />
    </FormControl>
      <Button onClick={onClick}>Insert</Button>
    </>
  );
}
