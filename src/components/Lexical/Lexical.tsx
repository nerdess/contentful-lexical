import { useState, useRef } from 'react';
import theme from '../../themes/defaultTheme';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
//import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';

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
import {
	Stack,
	Box,
	Flex
} from '@contentful/f36-components';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import CharacterCountPlugin from './plugins/CharacterCountPlugin';
import CopyPasteEnhancementPlugin from './plugins/copyPasteEnhancement/CopyPasteEnhancementPlugin';
//import ClickableLinkPlugin from './plugins/toolbar/link/ClickableLinkPlugin';
//import TreeViewPlugin from './plugins/TreeViewPlugin';
import Cleanups from './plugins/copyPasteEnhancement/Cleanups';
import { Cleanup } from './plugins/copyPasteEnhancement/types';
//import TreeViewPlugin from './plugins/TreeViewPlugin';
import './lexical.scss';
//import { DefinitionListNode } from './nodes/DefinitionListNode';
//import DefinitionListPlugin from './plugins/DefinitionListPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import { FAQContainerNode } from './nodes/FAQContainerNode';
import FAQPlugin from './plugins/FAQPlugin';
import { FAQItemNode } from './nodes/FAQItemNode';
import { FAQQuestionNode } from './nodes/FAQQuestionNode';
import { FAQAnswerNode } from './nodes/FAQAnswerNode';
import { FAQAnswerNodeInner } from './nodes/FAQAnswerNodeInner';
import TreeViewPlugin from './plugins/TreeViewPlugin';

function Placeholder() {
	return <div className='editor-placeholder'>Schreib los :)</div>;
}

const initialConfig = {
	namespace: 'Contentful',
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
		QuoteNode,
		HeadingNode,
		//DefinitionListNode,
		FAQContainerNode,
		FAQItemNode,
		FAQQuestionNode,
		FAQAnswerNode,
		FAQAnswerNodeInner,
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
            with: (node: ParagraphNode) => {
                return new CustomParagraphNode();
            },
            withKlass: CustomParagraphNode,
        },
		CustomTextNode,
		{
			replace: TextNode,
			with: (node: TextNode) => {
				return new CustomTextNode(node.__text);
			},
		},
		CustomLinkNode,
		{
			replace: LinkNode,
			with: (node: LinkNode) => {
				return new CustomLinkNode(
					node.getURL(),
					{
						target: node.getTarget(),
						rel: node.getRel(),
						title: node.getTitle(),
					}
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

const ContentEditableContainer = ({ resizable = true }) => {
	const [height, setHeight] = useState(320);
	const ref = useRef<HTMLDivElement>(null);

	if (!resizable) {
		return <ContentEditable className='editor-input' />;
	}

	return (
		<div ref={ref}>
			<Resizable
				minHeight={200}
				defaultSize={{
					height: 320,
					width: '100%',
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
				onResize={() => ref.current && setHeight(ref.current.clientHeight)}
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
	resizable,
	cleanups,
	setCleanups,
}: {
	initialValue: string;
	setValue: (value:string) => void;
	resizable: boolean;
	cleanups: Cleanup[];
	setCleanups: React.Dispatch<React.SetStateAction<Cleanup[]>>;
}) => {

	const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

	const onRef = (_floatingAnchorElem: HTMLDivElement) => {
		if (_floatingAnchorElem !== null) {
		  setFloatingAnchorElem(_floatingAnchorElem);
		}
	  };

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<Stack
				fullWidth
				flexDirection='column'
				spacing='spacing2Xs'
				alignItems='end'
			>
				<Flex flexDirection='column' className='editor-container'>
					<ToolbarPlugin />
					<Box className='editor-inner'>
						<RichTextPlugin
							contentEditable={
								<div ref={onRef}>
									<ContentEditableContainer resizable={resizable} />
								</div>
							}
							placeholder={<Placeholder />}
							ErrorBoundary={LexicalErrorBoundary}
						/>
						<HistoryPlugin />
						<ListPlugin />
						<LinkPlugin />
						{<FloatingLinkEditorPlugin />}
						<ListMaxIndentLevelPlugin maxDepth={7} />
						<ImagePlugin />
						{floatingAnchorElem && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />}
						<InitialContentPlugin htmlString={initialValue} />
						<OnChangePlugin
							ignoreNonChanges={true}
							onChange={(editorState, editor) => {
								editor.update(() => {
									const html = $generateHtmlFromNodes(editor, null);
									setValue(html);
								});
							}}
						/>
						<CopyPasteEnhancementPlugin setCleanups={setCleanups} />
						<FAQPlugin />
						{/*<DefinitionListPlugin />*/}
						{/*<TreeViewPlugin />*/}
						{/*<AutoFocusPlugin/>*/}
					</Box>
				</Flex>


				<Stack
					flexDirection='row'
					justifyContent='space-between'
					style={{ width: '100%' }}
				>
					<Box>
						<Cleanups cleanups={cleanups} />
					</Box>
					<Box>
						<CharacterCountPlugin />
					</Box>
				</Stack>
			</Stack>
		</LexicalComposer>
	);
};

export default Editor;
