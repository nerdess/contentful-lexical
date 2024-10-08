import { 
  ParagraphNode, 
  $applyNodeReplacement,
  LexicalEditor,
  SerializedParagraphNode
} from "lexical";

export function $createParagraphNode() {
  return $applyNodeReplacement(new ParagraphNode());
}

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return "custom-paragraph";
  }

  static clone(node: ParagraphNode) {
    return new CustomParagraphNode(node.__key);
  }

	static importJSON(): CustomParagraphNode {
		const node = $createParagraphNode();
		return node as CustomParagraphNode;
	}

  exportJSON(): SerializedParagraphNode {
    return {
      ...super.exportJSON(),
      type: 'custom-paragraph',
      version: 1,
    };
  }

  createDOM(config: any): HTMLElement {
    const dom = super.createDOM(config);
    //dom.style.backgroundColor = "green";
    return dom;
  }

  exportDOM(editor: LexicalEditor): { element: HTMLElement } {

    const element = super.createDOM(editor._config);

    //only apply style=text-align if it is not default (=left)
    const formatType = this.getFormatType();
    if (formatType !== 'left') element.style.textAlign = formatType;

    element.removeAttribute('dir');
    element.removeAttribute('class');

    return {
      element
    };
  }

  

}
