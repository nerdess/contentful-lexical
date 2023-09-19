import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    PASTE_COMMAND,
	  COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    $isRangeSelection,
    $isGridSelection,
    $getSelection
} from 'lexical';
import {
    //$getHtmlContent,
    //$getLexicalContent,
    $insertDataTransferForRichText,
  } from '@lexical/clipboard';
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
        clipboardData != null &&
        ($isRangeSelection(selection) || $isGridSelection(selection))
      ) {
        $insertDataTransferForRichText(clipboardData, selection, editor);
      }
    });
  }

const CopyPasteEnhancementPlugin = () => {

    const [editor] = useLexicalComposerContext();



    /*useEffect(() => {



        editor.focus(
          () => {
            // If we try and move selection to the same point with setBaseAndExtent, it won't
            // trigger a re-focus on the element. So in the case this occurs, we'll need to correct it.
            // Normally this is fine, Selection API !== Focus API, but fore the intents of the naming
            // of this plugin, which should preserve focus too.

            console.log('focus');

            const activeElement = document.activeElement;
            const rootElement = editor.getRootElement();
            if (
              rootElement !== null &&
              (activeElement === null || !rootElement.contains(activeElement))
            ) {
              // Note: preventScroll won't work in Webkit.
              rootElement.focus({preventScroll: true});
            }
          },
          {},
        );
      }, [editor]);*/
    


	useEffect(() => {
       return mergeRegister(
            editor.registerCommand(
                PASTE_COMMAND,
                (payload) => {
                    console.log('paste', payload);
                    return true;
                },
                COMMAND_PRIORITY_HIGH,
              ),
        );
	
		  
	}, [editor]);

    return null
}

export default CopyPasteEnhancementPlugin;