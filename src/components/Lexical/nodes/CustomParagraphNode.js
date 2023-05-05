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
    
    //const {element} = super.exportDOM(editor);
    const element = super.createDOM(editor._config, editor);

    element.removeAttribute('dir');
    element.removeAttribute('class');
    element.removeAttribute('style');

    return {
      element,
    };
  }

  /*createDOM(config) {
    const dom = super.createDOM(config);
    dom.style = "background: green";
    return dom;
  }*/
}
