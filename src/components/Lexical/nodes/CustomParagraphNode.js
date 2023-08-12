import { 
  ParagraphNode, 
  $applyNodeReplacement 
} from "lexical";

export function $createParagraphNode() {
  return $applyNodeReplacement(new ParagraphNode());
}

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return "custom-paragraph";
  }

  static clone(node) {
    return new CustomParagraphNode(node.__key);
  }


  static importJSON(serializedNode){
    const node = $createParagraphNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'custom-paragraph',
      version: 1,
    };
  }

    
  exportDOM(editor) {

    const element = super.createDOM(editor._config, editor);

    //only apply style=text-align if it is not default (=left)
    const formatType = this.getFormatType();
    if (formatType !== 'left') element.style.textAlign = formatType;

    element.removeAttribute('dir');
    element.removeAttribute('class');

    return {
      element,
      /*after: (el) => {
        return el;
      }*/
    };
  }
  

}
