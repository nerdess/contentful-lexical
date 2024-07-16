import { TextNode } from 'lexical';

export class CustomTextNode extends TextNode {

	static getType(): string {
		return 'custom-text';
	}

	static clone(node: TextNode): TextNode {
		return new CustomTextNode(node.__text);
	}

	static importJSON(serializedNode: any): TextNode {
		return super.importJSON(serializedNode);
	}

	exportJSON() {
		return {
			...super.exportJSON(),
			type: 'custom-text',
			version: 1,
		};
	}

}
