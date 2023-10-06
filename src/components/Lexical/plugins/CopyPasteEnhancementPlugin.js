import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    PASTE_COMMAND,
    COMMAND_PRIORITY_HIGH,
    $isRangeSelection,
    $isGridSelection,
    $getSelection
} from 'lexical';
import { $insertDataTransferForRichText } from "./utils/clipboard";
import {mergeRegister} from '@lexical/utils';

function onPasteForRichText(
    event,
    editor,
  ) {
    event.preventDefault();
    editor.update(() => {
      const selection = $getSelection();
      const clipboardData = event.clipboardData;
      if (
        clipboardData != null && ($isRangeSelection(selection) || $isGridSelection(selection))
      ) {
        $insertDataTransferForRichText(clipboardData, selection, editor);
      }
    });
  }

const CopyPasteEnhancementPlugin = () => {

    const [editor] = useLexicalComposerContext();

	useEffect(() => {
       return mergeRegister(
            editor.registerCommand(
                PASTE_COMMAND,
                (event) => {
        
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) || $isGridSelection(selection)) {
                      onPasteForRichText(event, editor);
                      return true;
                    }

                    return false;
                  
                },
                COMMAND_PRIORITY_HIGH,
              ),
        );
	
		  
	}, [editor]);

    return null
}

export default CopyPasteEnhancementPlugin;