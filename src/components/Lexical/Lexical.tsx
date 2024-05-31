import React, { useState, useRef } from 'react';
import theme from '../../themes/defaultTheme';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
//import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';

import { OnChangePlugin } from './plugins/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';

import { ImageNode } from './nodes/ImageNode';
import { CustomParagraphNode } from './nodes/CustomParagraphNode';
import { CustomTextNode } from './nodes/CustomTextNode';
import { CustomLinkNode } from './nodes/CustomLinkNode';

import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import FloatingLinkEditorPlugin from './plugins/toolbar/link/FloatingLinkEditorPlugin';
import LinkPlugin from './plugins/toolbar/link/LinkPlugin';
import ImagePlugin from './plugins/image/ImagePlugin';
import InitialContentPlugin from './plugins/InitialContentPlugin';
import { Resizable } from 're-resizable';
import { ParagraphNode, TextNode } from 'lexical';
import { Stack, Box, Flex } from '@contentful/f36-components';
import { HeadingNode} from '@lexical/rich-text';
import CharacterCountPlugin from './plugins/CharacterCountPlugin';
import CopyPasteEnhancementPlugin from './plugins/CopyPasteEnhancementPlugin';
//import ClickableLinkPlugin from './plugins/toolbar/link/ClickableLinkPlugin';
//import TreeViewPlugin from './plugins/TreeViewPlugin';
import './lexical.scss';


function Placeholder() {
	return <div className='editor-placeholder'>Schreib los :)</div>;
}

const initialConfig = {
	namespace:"Contentful",
	theme,
	// Handling of errors during update
	onError(error: Error) {
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
		//CustomHeadingNode,
		/*{
			replace: HeadingNode,
			with: (node) => {
				return new CustomHeadingNode();
			},
		},*/
		CustomParagraphNode,
		{
			replace: ParagraphNode,
			with: () => {
				return new CustomParagraphNode();
			},
		},
		CustomTextNode,
		{
			replace: TextNode,
			with: (node:TextNode) => {
				return new CustomTextNode(node.__text);
			},
		},
		CustomLinkNode,
		{
			replace: LinkNode,
			with: (node: LinkNode) => {
				//return new CustomLinkNode("https://google.com", { rel: "fdsfgds", target: "_blank" }, node.getKey());

				return new CustomLinkNode(
					node.getURL(),
					{
						target: node.getTarget(),
						rel: node.getRel(),
						title: node.getTitle(),
					},
					node.getKey()
				);
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

const ContentEditableContainer = ({
	resizable = true,
}) => {

	const [height, setHeight] = useState(320);
	const ref = useRef<HTMLDivElement>(null);


	if (!resizable) {
		return (
			<ContentEditable className='editor-input' />
		)
	}

	return (
		<div ref={ref}>
			<Resizable
				minHeight={200}
				defaultSize={{
					height: 320,
					width: '100%'
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
						bottom: -10,
					},
				}}
				onResize={() => ref.current && setHeight( ref.current.clientHeight)}
				style={{
					marginBottom: 10,
				}}
			>
				<div
					style={{
						display: 'flex',
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
	initialValue,
	setValue,
	resizable
}:{
	initialValue: string,
	setValue: (value: string) => void,
	resizable: boolean
}) => {

	const [html, setHtml] = useState<string>('');

	return (
	
		<LexicalComposer 
			initialConfig={initialConfig}
		>
			<Stack fullWidth flexDirection='column' spacing='spacing2Xs' alignItems='end'>
					<Flex  flexDirection='column' className='editor-container'>
						<ToolbarPlugin />
						<Box className="editor-inner">
							<RichTextPlugin
								contentEditable={<ContentEditableContainer resizable={resizable} />}
								placeholder={<Placeholder />}
								ErrorBoundary={LexicalErrorBoundary}
							/>

							<HistoryPlugin />
							<ListPlugin />
							<LinkPlugin />
							<FloatingLinkEditorPlugin />
							<ListMaxIndentLevelPlugin maxDepth={7} />
							<ImagePlugin />
							<InitialContentPlugin htmlString={initialValue} />
							<OnChangePlugin
								ignoreNonChanges={true}
								onChange={(editorState, editor) => {
									editor.update(() => {
										const foo = $generateHtmlFromNodes(editor, null);
										console.log(foo);
										setHtml(foo);
										setValue($generateHtmlFromNodes(editor, null));
									});
								}}
							/>
							<CopyPasteEnhancementPlugin />
							{/*<TreeViewPlugin />*/}
							{/*<AutoFocusPlugin/>*/}
						</Box>
				</Flex>
				
				<p style={{
					fontSize: '18px',
					lineHeight: '29px', 
					color: '#2a2a2a', 
					fontFamily: 'AbrilText-Regular, Georgia, serif',
					marginTop: '1em',
					marginBottom:'1em'
				}}>
				<div dangerouslySetInnerHTML={{ __html:html}} />
				</p>

				<div dangerouslySetInnerHTML={{ __html: '<p style="font-size: 18px; line-height: 29px; color: #2a2a2a; font-family: AbrilText-Regular, Georgia, serif; margin-top: 1em; margin-bottom: 1em;">wie weiter mit der <b style="font-size: 18px; line-height: 29px; color: #2a2a2a; font-family: AbrilText-Regular, Georgia, serif; font-weight: bold; ">Gemeinsamen Agrarpolitik</b>(GAP) der Europäischen Union? Das ist die Klammer zu mehreren Texten der heutigen Ausgabe. Die Zukunft der GAP wird einerseits vom möglichen<b style="font-size: 18px; line-height: 29px; color: #2a2a2a; font-family: AbrilText-Regular, Georgia, serif; font-weight: bold; ">Beitritt der Ukraine</b>bestimmt. Das Land hat nach Einschätzung der Bundesregierung sämtliche Reformvorgaben dafür umgesetzt, hieß es gestern. Zwar wird es noch dauern, bis die Ukraine politisch Teil von Europa wird. Aber es gibt schon Untersuchungen, die die <b style="font-size: 18px; line-height: 29px; color: #2a2a2a; font-family: AbrilText-Regular, Georgia, serif; font-weight: bold; ">Folgen für den Agrarsektor</b><span style="font-size: 18px; line-height: 29px; color: #2a2a2a; font-family: AbrilText-Regular, Georgia, serif;"> durchspielen. Theresa Crysmann analysiert die Zusammenhänge.</span></p>' }} />
				<Box>
					<CharacterCountPlugin />
				</Box>
			</Stack>
		</LexicalComposer>

	);
};

export default Editor;
