import {
  TextNode,
  $createTextNode,
  isHTMLElement,
  LexicalEditor,
  SerializedTextNode,
  DOMConversionOutput,
  $applyNodeReplacement,
  DOMConversionMap,
} from 'lexical';

import invariant from '../shared/invariant';

export type SerializedCustomTextNode = SerializedTextNode;

type Mapping = {
  [key: string]: string;
};

const MAPPING = {
  bold: 'strong',
  italic: 'em',
  strikethrough: 's',
  underline: 'u',
} as Mapping;

const applyFormatting = (
  element: HTMLElement,
  formatting: Record<string, boolean>
): HTMLElement => {
  //no formatting needed;
  if (Object.values(formatting).every((value: boolean) => !value)) {
    return element;
  }

  //formatting is needed
  const text = element.textContent || '';
  const el = document.createElement('span'); //create temp span element
  el.textContent = text;

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
};

export const $createCustomTextNode = (text = ''): CustomTextNode => {
  return $applyNodeReplacement(new CustomTextNode(text));
};

const convertTextNode = (domNode: HTMLElement): DOMConversionOutput => {
  const text = domNode.textContent || '';
  const node = $createCustomTextNode(text);
  const style = domNode.getAttribute('style');
  if (style) {
    node.setStyle(style);
  }

  return { node };
};

export class CustomTextNode extends TextNode {
  static clone(node: CustomTextNode): CustomTextNode {
    return new CustomTextNode(node.__text, node.__key);
  }

  static getType(): string {
    return 'custom-text';
  }

  static importJSON(serializedNode: SerializedCustomTextNode): CustomTextNode {
    const node = $createTextNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node as CustomTextNode;
  }

  exportJSON(): SerializedCustomTextNode {
    return {
      ...super.exportJSON(),
      type: 'custom-text',
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: () => ({
        conversion: convertTextNode,
        priority: 0,
      }),
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

    const formatting: Record<string, boolean> = {
      bold: this.hasFormat('bold'),
      italic: this.hasFormat('italic'),
      strikethrough: this.hasFormat('strikethrough'),
      underline: this.hasFormat('underline'),
    };

    element = applyFormatting(element, formatting);

    return {
      element,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      after: (element: any): any => {
        //remove those empty <span>tags created by lexical
        if (element.tagName === 'SPAN' && element.attributes.length === 0) {
          return element.textContent;
        }

        return element;
      },
    };
  }
}
