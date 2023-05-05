import theme from '../../themes/defaultTheme';

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

import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';

import { ImageNode } from "./nodes/ImageNode";
import {CustomParagraphNode} from './nodes/CustomParagraphNode';
import {CustomTextNode} from './nodes/CustomTextNode';

import TreeViewPlugin from './plugins/TreeViewPlugin';
import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import ClickableLinkPlugin from './plugins/toolbar/link/ClickableLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/toolbar/link/FloatingLinkEditorPlugin';
import LinkPlugin from './plugins/toolbar/link/LinkPlugin';
import ImagePlugin from "./plugins/ImagePlugin.ts";
import InitialContentPlugin from './plugins/InitialContentPlugin';

import { $generateNodesFromDOM } from '@lexical/html';

import { Resizable } from 're-resizable';

import {
	$getRoot,
	$getSelection,
	$insertNodes,
	$createParagraphNode,
} from 'lexical';


import {ParagraphNode, TextNode} from 'lexical';

import './lexical.scss';


function Placeholder() {
	return <div className='editor-placeholder'>Leg los :)</div>;
}

const regex = /<\/?span>/g;

const editorConfig = {
	theme,
	// Handling of errors during update
	onError(error) {
		throw error;
	},
	// Any custom nodes go here
	nodes: [
		ListNode,
		ListItemNode,
		AutoLinkNode,
		LinkNode,
		ImageNode,
		CustomParagraphNode,
		CustomTextNode,
		{
			replace: ParagraphNode,
			with: (node) => {
			  return new CustomParagraphNode();
			}
		},
		{
			replace: TextNode,
			with: (node) => {
			  return new CustomTextNode(node.__text);
			}
		}

	],
};

const Editor = ({
	initialValue = '',
	setValue = () => {},
}) => {
	
	return (
		<LexicalComposer initialConfig={editorConfig}>
			<div className='editor-container'>
				<ToolbarPlugin />
				<div className='editor-inner'>
					<RichTextPlugin
						contentEditable={
							<Resizable
								minHeight={200}
								height={320}
								style={{
									overflow: 'hidden'
								}}
							>
								<ContentEditable className='editor-input' />
							</Resizable>
						}
						placeholder={<Placeholder />}
						ErrorBoundary={LexicalErrorBoundary}
					/>

					<HistoryPlugin />
					{<TreeViewPlugin />}
					<AutoFocusPlugin />
					<ListPlugin />
					<ClickableLinkPlugin />
					<LinkPlugin />
          			<FloatingLinkEditorPlugin />
					<ListMaxIndentLevelPlugin maxDepth={7} />
					<ImagePlugin />
					<InitialContentPlugin htmlString={initialValue} />
					<OnChangePlugin onChange={(editorState, editor) => {
						editor.update(() => {

							const html = $generateHtmlFromNodes(editor, null);
							let value = '';

							if (html !== '<p></p>') {
								value = html.replace(regex, '');
							} 
							console.log('html: ', value);
							setValue(value)
						})
					}} />
				</div>
			</div>
		</LexicalComposer>
	);
}

export default Editor;