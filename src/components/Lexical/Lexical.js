import { useState, useRef } from 'react';
import theme from '../../themes/defaultTheme';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';

import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';

import { ImageNode } from './nodes/ImageNode';
import { CustomParagraphNode } from './nodes/CustomParagraphNode';
import { CustomTextNode } from './nodes/CustomTextNode';

//import TreeViewPlugin from './plugins/TreeViewPlugin';
import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import ClickableLinkPlugin from './plugins/toolbar/link/ClickableLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/toolbar/link/FloatingLinkEditorPlugin';
import LinkPlugin from './plugins/toolbar/link/LinkPlugin';
import ImagePlugin from './plugins/ImagePlugin.ts';
import InitialContentPlugin from './plugins/InitialContentPlugin';

import { Resizable } from 're-resizable';

import { ParagraphNode, TextNode } from 'lexical';

import './lexical.scss';

function Placeholder() {
	return <div className='editor-placeholder'>Schreib los :)</div>;
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
		CustomTextNode,
		//ParagraphNode,
		CustomParagraphNode,
		{
			replace: ParagraphNode,
			with: (node) => {
				//console.log('node....', node);
				return new CustomParagraphNode();
			},
		},
		{
			replace: TextNode,
			with: (node) => {
				return new CustomTextNode(node.__text);
			},
		},
	],
};

const BottomRightHandle = () => (
	<div className='editor-resize-handle'>
		<span />
		<span />
		<span />
	</div>
);

const ContentEditableContainer = () => {

	const [height, setHeight] = useState(320);
	const ref = useRef(null);

	return (
		<div ref={ref}>
			<Resizable
				minHeight={200}
				defaultSize={{
					height: 320,
				}}
				enable={{
					top: false,
					right: false,
					bottom: true,
					left: false,
					topRight: false,
					bottomRight: false,
					bottomLeft: false,
					topLeft: false,
				}}
				handleComponent={{
					bottom: <BottomRightHandle />,
				}}
				handleStyles={{
					bottom: {
						bottom: -10
					}
				}}
				onResize={() => setHeight(ref.current.clientHeight)}
				style={{
					marginBottom: 10
				}}
			>
				<div 
					style={{
						overflow: 'auto',
						height,
					}}
				>
					<ContentEditable className='editor-input' />
				</div>
			</Resizable>
		</div>
	);
};

const Editor = ({ initialValue = '', setValue = () => {} }) => {
	
	return (
		<LexicalComposer initialConfig={editorConfig}>
			<div className='editor-container'>
				<ToolbarPlugin />
				<div className='editor-inner'>
					<RichTextPlugin
						contentEditable={<ContentEditableContainer />}
						placeholder={<Placeholder />}
						ErrorBoundary={LexicalErrorBoundary}
					/>

					<HistoryPlugin />
					{/*<TreeViewPlugin />*/}
					<AutoFocusPlugin />
					<ListPlugin />
					<ClickableLinkPlugin />
					<LinkPlugin />
					<FloatingLinkEditorPlugin />
					<ListMaxIndentLevelPlugin maxDepth={7} />
					<ImagePlugin />
					<InitialContentPlugin htmlString={initialValue} />
					<OnChangePlugin
						onChange={(editorState, editor) => {
				
							editor.update(() => {
								const html = $generateHtmlFromNodes(editor, null);
								let newValue = '';

								if (html !== '<p></p>') {
									newValue = html.replace(regex, '');
								}

								setValue(newValue);

							});
		
						}}
					/>
				</div>
			</div>
		</LexicalComposer>
	);
};

export default Editor;
