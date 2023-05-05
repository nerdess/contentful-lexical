import {
	$getRoot,
	$insertNodes,
	$createParagraphNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';

//const htmlString = '<b>Just some outside bold text</b><p>There was an alien bla fooo bla ><b><a href="http://www.test.de" target="_blank">Foooo</a>I am bold</b></p><br><p><b><i>I am bold and italic</i></b></p>';

const InitialContentPlugin = ({htmlString}) => {

	const [editor] = useLexicalComposerContext();
;
	editor.update(() => {
		
		const parser = new DOMParser();
		const dom = parser.parseFromString(htmlString, 'text/html');

		// Once you have the DOM instance it's easy to generate LexicalNodes.
		const nodes = $generateNodesFromDOM(editor, dom)
			.map((node) => {
				if (node.getType() === 'text') {
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
		$getRoot().select();

		// Insert them at a selection.
		$insertNodes(nodes);
	});

	return null;
};

export default InitialContentPlugin;
