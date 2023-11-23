import { LinkNode } from '@lexical/link';

export class CustomLinkNode extends LinkNode {
  static getType() {
    return "custom-link";
  }

  static clone(node) {
    return new CustomLinkNode(node.getURL(), { rel: node.getRel(), target: node.getTarget() }, node.getKey());
  }

  createDOM(config) {
    return super.createDOM(config);
  }
}