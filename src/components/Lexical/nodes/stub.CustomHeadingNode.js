/*

note to self: might be of use one day when more than one custom h2 is needed

*/


import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import { 
    //ParagraphNode, 
    $applyNodeReplacement 
} from "lexical";
  
  export function $createParagraphNode() {
    return $applyNodeReplacement(new HeadingNode());
  }
  
  export class CustomHeadingNode extends HeadingNode {
    static getType() {
      return "custom-heading";
    }
  
    static clone(node) {
      return new CustomHeadingNode(node.__key);
    }
  
    exportJSON() {
      return {
        ...super.exportJSON(),
        type: 'custom-heading',
        version: 1,
      };
    }
  
      
    exportDOM(editor) {
  
      const element = super.createDOM(editor._config, editor);
  
      //only apply style=text-align if it is not default (=left)
      /*const formatType = this.getFormatType();
      if (formatType !== 'left') element.style.textAlign = formatType;
  
      element.removeAttribute('dir');
      element.removeAttribute('class');*/
      console.log('!!!!!!!!!!!!!');
  
      return {
        element,
        /*after: (el) => {
          return el;
        }*/
      };
    }
    
  
  }
  