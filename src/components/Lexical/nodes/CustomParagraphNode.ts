import {
  ParagraphNode,
  $applyNodeReplacement,
  LexicalEditor,
  SerializedParagraphNode,
  DOMConversionMap,
  DOMConversionOutput,
} from 'lexical';

const convertParagraphElement = (): DOMConversionOutput => {
  return {
    node: $createParagraphNode(),
  };
};

export function $createParagraphNode() {
  return $applyNodeReplacement(new ParagraphNode());
}

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return 'custom-paragraph';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createDOM(config: any): HTMLElement {
    const dom = super.createDOM(config);
    //dom.style.backgroundColor = "green";
    return dom;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: () => ({
        conversion: convertParagraphElement,
        priority: 0,
      }),
    };
  }

  exportDOM(editor: LexicalEditor): { element: HTMLElement } {
    const element = super.createDOM(editor._config);

    //only apply style=text-align if it is not default (=left)
    const formatType = this.getFormatType();
    if (formatType !== 'left') element.style.textAlign = formatType;

    element.removeAttribute('dir');
    element.removeAttribute('class');

    return {
      element,
    };
  }
}
