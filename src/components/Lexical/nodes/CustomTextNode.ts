import { TextNode, $createTextNode, isHTMLElement, LexicalEditor } from 'lexical';
import invariant from '../shared/invariant';

interface Formatting extends Record<string, any> {};

type Mapping = {
	[key: string]: string;
}

const MAPPING = {
	bold: 'strong',
	italic: 'em',
	strikethrough: 's',
	underline: 'u',
} as Mapping;

const applyFormatting = (element: HTMLElement, formatting: Formatting): HTMLElement => {

	//no formatting needed;
	if (Object.values(formatting).every((value: boolean) => !value)) {
		return element;
	}

	//formatting is needed
	const text = element.innerText;
	const el = document.createElement('span'); //create temp span element
	el.innerText = text;

	const tagNames = Object.keys(formatting)
		.filter((key: string) => formatting[key])
		.map((key: string) => MAPPING[key]);

	const wrappedElement = tagNames.reduceRight((wrapped, tagName) => {
		const el = document.createElement(tagName);
		el.appendChild(wrapped);
		return el;
	}, el);

	el.replaceWith(...el.childNodes); //removes the temp span element

	return wrappedElement;
}

export class CustomTextNode extends TextNode {
	static getType() {
		return 'custom-text';
	}

	//this causes whole paragraph being copied and not just the selected text - why?
	//is this even needed?
	/*static clone(node: TextNode) {
		return new CustomTextNode(node.__text);
	}*/

	static importJSON(serializedNode: any) {
		const node = $createTextNode(serializedNode.text);
		node.setFormat(serializedNode.format);
		node.setDetail(serializedNode.detail);
		node.setMode(serializedNode.mode);
		node.setStyle(serializedNode.style);
		return node;
	}

	exportJSON() {
		return {
			detail: this.getDetail(),
			format: this.getFormat(),
			mode: this.getMode(),
			style: this.getStyle(),
			text: this.getTextContent(),
			type: 'custom-text',
			version: 1,
		};
	}

	// This improves Lexical's basic text output in copy+paste plus
	// for headless mode where people might use Lexical to generate
	// HTML content and not have the ability to use CSS classes.
	exportDOM(editor: LexicalEditor) {
		let element = super.createDOM(editor._config) as HTMLElement;

		invariant(
			element !== null && isHTMLElement(element),
			'Expected TextNode createDOM to always return a HTMLElement'
		);

		element.removeAttribute('class');

		const formatting: Formatting = {
			bold: this.hasFormat('bold'),
			italic: this.hasFormat('italic'),
			strikethrough: this.hasFormat('strikethrough'),
			underline: this.hasFormat('underline'),
		};

		element = applyFormatting(element, formatting);

		return {
			element,
			after: (element: any): any => {

				//remove those empty <span>tags created by lexical
				if (element.tagName === 'SPAN' && element.attributes.length === 0) {
					return element.textContent;
				}

				return element;
			}
		};
	}
}
