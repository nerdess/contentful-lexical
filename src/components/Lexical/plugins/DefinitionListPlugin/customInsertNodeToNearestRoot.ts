import { $getPreviousSelection, $getRoot, $getSelection, $isRangeSelection, $isRootOrShadowRoot, $isTextNode, $splitNode, ElementNode, LexicalNode } from "lexical";

export function $customInsertNodeToNearestRoot<T extends LexicalNode>(node: T): T {

    const selection = $getSelection() || $getPreviousSelection();
  
    if ($isRangeSelection(selection)) {

      const {focus} = selection;
      const focusNode = focus.getNode();
      const focusOffset = focus.offset;
  
      if ($isRootOrShadowRoot(focusNode)) {
        const focusChild = focusNode.getChildAtIndex(focusOffset);
        if (focusChild == null) {
          focusNode.append(node);
        } else {
          focusChild.insertBefore(node);
        }
        node.selectNext();
      } else {
        let splitNode: ElementNode;
        let splitOffset: number;
        if ($isTextNode(focusNode)) {
          splitNode = focusNode.getParentOrThrow();
          splitOffset = focusNode.getIndexWithinParent();
          if (focusOffset > 0) {
            splitOffset += 1;
            focusNode.splitText(focusOffset);
          }
        } else {
          splitNode = focusNode;
          splitOffset = focusOffset;
        }
        const [leftTree, rightTree] = $splitNode(splitNode, splitOffset);
        rightTree.insertBefore(node);
        //leftTree?.isEmpty && leftTree.remove();
        //rightTree.remove();
      }
    } else {
      if (selection != null) {
        const nodes = selection.getNodes();
        nodes[nodes.length - 1].getTopLevelElementOrThrow().insertAfter(node);
      } else {
        const root = $getRoot();
        root.append(node);
      }
    }
    return node.getLatest();
  }