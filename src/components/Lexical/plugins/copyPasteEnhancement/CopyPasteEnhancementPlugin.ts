import React, { useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	PASTE_COMMAND,
	COMMAND_PRIORITY_HIGH,
	$isRangeSelection,
	$getSelection,
} from 'lexical';
import { $insertDataTransferForRichText } from '../utils/clipboard';
import { mergeRegister } from '@lexical/utils';

const CopyPasteEnhancementPlugin = ({
	setCleanups
}:{
	setCleanups?: React.Dispatch<React.SetStateAction<any[]>>
}) => {
	const [editor] = useLexicalComposerContext();

	const onPasteForRichText = useCallback((event: any, editor: any) => {
		event.preventDefault();
		editor.update(() => {
			const selection = $getSelection();
			const clipboardData = event.clipboardData;
			if (
				clipboardData != null &&
				$isRangeSelection(selection)
			) {
				const cleanups = $insertDataTransferForRichText(clipboardData, selection, editor);
				setCleanups && setCleanups((prev) => prev.concat(cleanups));
				
			}
		});
	}, [setCleanups]);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				PASTE_COMMAND,
				(event) => {
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
