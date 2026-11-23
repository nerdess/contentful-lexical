import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH, $isRangeSelection, $getSelection } from 'lexical';
import { type Dispatch, type SetStateAction, useCallback, useEffect } from 'react';

import { $insertDataTransferForRichText } from '../utils/clipboard';

import type { Cleanup } from './types';

const CopyPasteEnhancementPlugin = ({
  setCleanups,
}: {
  setCleanups?: Dispatch<SetStateAction<Cleanup[]>>;
}) => {
  const [editor] = useLexicalComposerContext();

  const onPasteForRichText = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any, editor: any) => {
      event.preventDefault();
      editor.update(() => {
        const selection = $getSelection();
        const clipboardData = event.clipboardData;
        if (clipboardData != null && $isRangeSelection(selection)) {
          const cleanups = $insertDataTransferForRichText(clipboardData, selection, editor);
          if (setCleanups) {
            setCleanups(prev => prev.concat(cleanups));
          }
        }
      });
    },
    [setCleanups]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        PASTE_COMMAND,
        event => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            onPasteForRichText(event, editor);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, onPasteForRichText]);

  return null;
};

export default CopyPasteEnhancementPlugin;
