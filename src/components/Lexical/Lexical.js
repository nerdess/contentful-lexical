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

//import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { OnChangePlugin } from './plugins/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';

import { ImageNode } from './nodes/ImageNode';
import { CustomParagraphNode } from './nodes/CustomParagraphNode';
import { CustomTextNode } from './nodes/CustomTextNode';
import { CustomLinkNode } from './nodes/CustomLinkNode';

import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import ClickableLinkPlugin from './plugins/toolbar/link/ClickableLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/toolbar/link/FloatingLinkEditorPlugin';
import LinkPlugin from './plugins/toolbar/link/LinkPlugin';
import ImagePlugin from './plugins/ImagePlugin.ts';
import InitialContentPlugin from './plugins/InitialContentPlugin';
import { Resizable } from 're-resizable';
import { ParagraphNode, TextNode } from 'lexical';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import { Stack, Box } from '@contentful/f36-components';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import './lexical.scss';

function Placeholder() {
	return <div className='editor-placeholder'>Schreib los :)</div>;
}

const initialConfig = {
	theme,
	// Handling of errors during update
	onError(error) {
		throw error;
	},
	// Any custom nodes go here
	nodes: [
		HeadingNode,
		ListNode,
		ListItemNode,
		AutoLinkNode,
		ImageNode,
		HeadingNode,
		/*CustomHeadingNode,
		{
			replace: HeadingNode,
			with: (node) => {
				return new CustomHeadingNode();
			},
		},*/
		CustomParagraphNode,
		{
			replace: ParagraphNode,
			with: (node) => {
				return new CustomParagraphNode();
			},
		},
		CustomTextNode,
		{
			replace: TextNode,
			with: (node) => {
				return new CustomTextNode(node.__text);
			},
		},
		CustomLinkNode,
		{
		  replace: LinkNode,
		  with: (node) => {
			//return new CustomLinkNode("https://google.com", { rel: "fdsfgds", target: "_blank" }, node.getKey());
			return new CustomLinkNode(
                node.getURL(),
                {
					target: node.getTarget(), 
					rel: node.getRel(), 
					title: node.getTitle()
				},
                node.getKey()
              );
		  },
		},
		/*{
			replace: LinkNode,
			with: (node) => {
				return new CustomLinkNode(node.__text);
			},
		},*/
		/*{
            replace: LinkNode,
            with: (node) => {
              node.setTarget('_blank'); //maybe delete this and simply use "_blank" on target property of new node
              return new LinkNode(
                node.getURL(),
                { target: '_blank', rel: node.getRel(), title: node.getTitle()},
                undefined
              );
            },
          },*/ 

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



const Editor = ({ 
	initialValue = '',
	//initalContentHasBeenTransformed = false,
	setValue = () => {} 
}) => {
	
	return (
		<Stack flexDirection="column" flex="0" spacing="spacingS">
			{/*initalContentHasBeenTransformed && (
				<Box style={{width: '100%'}}>
					<Note variant="warning">
						<Stack spacing="spacing2Xs" flexDirection="column" alignItems="start">
							<Stack spacing="spacing2Xs">
								<Text>Der Originaltext wurde vom WYSIWYG-Editor gesäubert.</Text>
								<Text fontColor="red500">Bitte Text prüfen und erneut publishen!</Text>
							</Stack>
							<Tooltip 
								content="Der WYSIWYG-Editor hat automatisch unnötige HTML-Tags entfernt. Der Inhalt selbst wurde nicht verändert, lediglich Sonderzeichen oder spezielle HTML-Entities wie &amp;nbsp; oder &amp;ndash; können Probleme bereiten und sollten jetzt manuell überprüft werden. Die verbesserte HTML-Struktur macht ein erneutes Publishen notwendig."
							>
								<Text 
									fontSize="fontSizeS"
									style={{
										textDecoration: 'underline',
										textDecorationStyle: 'dashed',
										textDecorationThickness: '0.5px',
										textDecorationColor: 'gray'
									}}
								>
									Was bedeutet das?
								</Text>
							</Tooltip>
						</Stack>
					</Note>
				</Box>
			)*/}

			<Box style={{width: '100%'}}>
			<LexicalComposer initialConfig={initialConfig}>
				<div className='editor-container'>
					<ToolbarPlugin />
					<div className='editor-inner'>
						<RichTextPlugin
							contentEditable={<ContentEditableContainer />}
							placeholder={<Placeholder />}
							ErrorBoundary={LexicalErrorBoundary}
						/>

						<HistoryPlugin />
						<TreeViewPlugin />
						<AutoFocusPlugin />
						<ListPlugin />
						<ClickableLinkPlugin />
						<LinkPlugin />
						<FloatingLinkEditorPlugin />
						<ListMaxIndentLevelPlugin maxDepth={7} />
						<ImagePlugin />
						{<InitialContentPlugin htmlString={initialValue} />}
						<OnChangePlugin
							ignoreNonChanges={true}
							onChange={(editorState, editor) => {
								editor.update(() => {
									const html = $generateHtmlFromNodes(editor, null);
									setValue(html);

								});
			
							}}
						/>
					</div>
				</div>
			</LexicalComposer>
			</Box>
		</Stack>
	);
};

export default Editor;
