import { ParagraphNode } from "lexical";

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return "custom-paragraph";
  }

  static clone(node) {
    return new CustomParagraphNode(node.__key);
  }

  exportDOM(editor) {
    
    //const {element} = super.exportDOM(editor);
    const element = super.createDOM(editor._config, editor);

    element.removeAttribute('dir');
    element.removeAttribute('class');
    element.removeAttribute('style');

    console.log('element', element);

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
