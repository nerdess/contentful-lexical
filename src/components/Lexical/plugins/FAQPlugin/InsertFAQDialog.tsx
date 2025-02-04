/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {LexicalEditor} from 'lexical';
import {useState} from 'react';
import { FormControl, Note, Stack, TextInput } from '@contentful/f36-components';
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
          <Stack flexDirection="column" alignItems="start" spacing="spacingS">
            <Note variant="neutral">
              The number of questions cannot be changed after creation.
            </Note>
            <TextInput
                value={value.toString()}
                type="number"
                style={{width: 100}}
                onChange={(e) => setValue(e.target.value)}
            />
          </Stack>
      </FormControl>
      <Button onClick={onClick}>Insert</Button>
    </>
  );
}
