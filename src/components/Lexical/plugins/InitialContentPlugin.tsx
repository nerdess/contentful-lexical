import { useEffect } from 'react';
import { $getRoot, $insertNodes, $createParagraphNode, LexicalNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';

const InitialContentPlugin = ({ 
	htmlString 
}:{
	htmlString: string
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {

		editor.update(() => {

			const _htmlString = (!htmlString) ? '' : htmlString;
			const parser = new DOMParser();
			const dom = parser.parseFromString(_htmlString, 'text/html');

			// Once you have the DOM instance it's easy to generate LexicalNodes.
			const nodes = $generateNodesFromDOM(editor, dom)
				.map((node: LexicalNode) => {
					if (node.getType() === 'text' || node.getType() === 'custom-text') {
						if (node.getTextContent().trim() === '') {
							return null;
						} else {
							return $createParagraphNode().append(node);
						}
					}

					if (node.getType() === 'linebreak') {
						return null;
					}

					return node;
				})
				.filter((node) => !!node);

			// Select the root
			const root = $getRoot();
			root.select();
			root.clear();

			// Insert them at a selection.
			$insertNodes(nodes as LexicalNode[]);
		});
	}, [editor, htmlString]);

	return null;
};

export default InitialContentPlugin;
