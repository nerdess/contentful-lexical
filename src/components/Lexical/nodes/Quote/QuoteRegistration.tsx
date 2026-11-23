import { LexicalNode, NodeKey } from 'lexical';

import { QuoteAuthorNode } from './QuoteAuthorNode';
import { QuoteContainerNode } from './QuoteContainerNode';
import { QuoteContentNode } from './QuoteContentNode';

type LexicalNodeConstructor<T extends LexicalNode> = new (key?: NodeKey, ...args: unknown[]) => T;

export function registerQuoteNodes<T extends LexicalNode>(nodes: Array<LexicalNodeConstructor<T>>) {
  nodes.push(QuoteContainerNode as unknown as LexicalNodeConstructor<T>);
  nodes.push(QuoteContentNode as unknown as LexicalNodeConstructor<T>);
  nodes.push(QuoteAuthorNode as unknown as LexicalNodeConstructor<T>);
}

export {
  QuoteContainerNode,
  $createQuoteContainerNode,
  $isQuoteContainerNode,
} from './QuoteContainerNode';

export { QuoteContentNode, $createQuoteContentNode, $isQuoteContentNode } from './QuoteContentNode';

export { QuoteAuthorNode, $createQuoteAuthorNode, $isQuoteAuthorNode } from './QuoteAuthorNode';

export { INSERT_QUOTE_COMMAND, TOGGLE_QUOTE_MODAL_COMMAND } from './index';

export { default as QuotePlugin } from './index';
export { default as QuoteModal } from './QuoteModal';
export { default as QuoteComponent } from './QuoteComponent';
