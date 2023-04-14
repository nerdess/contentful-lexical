import ExampleTheme from '../../themes/ExampleTheme';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ImageNode } from "./nodes/ImageNode";


//import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';

import ClickableLinkPlugin from './plugins/toolbar/link/ClickableLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/toolbar/link/FloatingLinkEditorPlugin';
import LinkPlugin from './plugins/toolbar/link/LinkPlugin';
import ImagePlugin from "./plugins/ImagePlugin.ts";


import InitialContentPlugin from './plugins/InitialContentPlugin';

import {
	$getRoot,
	$getSelection,
	$insertNodes,
	$createParagraphNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import './lexical.scss';

function Placeholder() {
	return <div className='editor-placeholder'>Enter some rich text...</div>;
}

const editorConfig = {
	// The editor theme
	theme: ExampleTheme,
	// Handling of errors during update
	onError(error) {
		throw error;
	},
	// Any custom nodes go here
	nodes: [
		HeadingNode,
		ListNode,
		ListItemNode,
		QuoteNode,
		CodeNode,
		CodeHighlightNode,
		TableNode,
		TableCellNode,
		TableRowNode,
		AutoLinkNode,
		LinkNode,
		ImageNode
	],
};

export default function Editor() {

	return (
		<LexicalComposer initialConfig={editorConfig}>
			<div className='editor-container'>
				<ToolbarPlugin />
				<div className='editor-inner'>
					<RichTextPlugin
						contentEditable={<ContentEditable className='editor-input' />}
						placeholder={<Placeholder />}
						ErrorBoundary={LexicalErrorBoundary}
					/>
          			<InitialContentPlugin />
					<HistoryPlugin />
					<TreeViewPlugin />
					<AutoFocusPlugin />
					<ListPlugin />
					<ClickableLinkPlugin />
					<LinkPlugin />
          			<FloatingLinkEditorPlugin />
					<ListMaxIndentLevelPlugin maxDepth={7} />
					<ImagePlugin />
				</div>
			</div>
		</LexicalComposer>
	);
}
