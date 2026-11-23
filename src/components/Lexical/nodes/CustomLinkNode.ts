import { LinkNode } from '@lexical/link';

export class CustomLinkNode extends LinkNode {
  static getType() {
    return 'custom-link';
  }

  static clone(node: LinkNode) {
    return new CustomLinkNode(
      node.getURL(),
      {
        rel: node.getRel(),
        target: node.getTarget(),
      },
      node.getKey()
    );
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'custom-link',
      version: 1,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createDOM(config: any) {
    return super.createDOM(config);
  }
}
