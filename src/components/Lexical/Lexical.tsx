import { Stack, Box, Flex } from '@contentful/f36-components';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TreeView } from '@lexical/react/LexicalTreeView';
import { Resizable } from 're-resizable';
import { useState, useRef } from 'react';

import { editorConfig } from './editorConfig';
import { $getHtml } from './html';
import { QuotePlugin } from './nodes/Quote/QuoteRegistration';
import CharacterCountPlugin from './plugins/CharacterCountPlugin';
import Cleanups from './plugins/copyPasteEnhancement/Cleanups';
import CopyPasteEnhancementPlugin from './plugins/copyPasteEnhancement/CopyPasteEnhancementPlugin';
import type { Cleanup } from './plugins/copyPasteEnhancement/types';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import FAQPlugin from './plugins/FAQPlugin';
import ImagePlugin from './plugins/image/ImagePlugin';
import InitialContentPlugin from './plugins/InitialContentPlugin';
import { OnChangePlugin } from './plugins/LexicalOnChangePlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import FloatingLinkEditorPlugin from './plugins/toolbar/link/FloatingLinkEditorPlugin';
import LinkPlugin from './plugins/toolbar/link/LinkPlugin';
import ToolbarPlugin from './plugins/toolbar/ToolbarPlugin';
import TransformH4ToH2 from './plugins/TransformH4toH2';

import './lexical.scss';

function TreeViewPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      viewClassName='tree-view-output' // Add custom classes for styling if needed
      treeTypeButtonClassName='debug-treetype-button'
      timeTravelPanelClassName='debug-timetravel-panel'
      timeTravelButtonClassName='debug-timetravel-button'
      timeTravelPanelSliderClassName='debug-timetravel-panel-slider'
      timeTravelPanelButtonClassName='debug-timetravel-panel-button'
      editor={editor}
    />
  );
}

function Placeholder() {
  return <div className='editor-placeholder'>Schreib los :)</div>;
}

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
  setValue: (value: string) => void;
  resizable: boolean;
  cleanups: Cleanup[];
  setCleanups: React.Dispatch<React.SetStateAction<Cleanup[]>>;
}) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement | null) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Stack fullWidth flexDirection='column' spacing='spacing2Xs' alignItems='end'>
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
            <QuotePlugin />
            {floatingAnchorElem && <FloatingLinkEditorPlugin />}
            <ListMaxIndentLevelPlugin maxDepth={7} />
            <ImagePlugin />
            {floatingAnchorElem && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />}
            <InitialContentPlugin htmlString={initialValue} />
            <OnChangePlugin
              ignoreNonChanges={true}
              onChange={(editorState, editor) => {
                const html = editorState.read(() => $getHtml(editor), {
                  editor,
                });
                setValue(html);
              }}
            />
            <CopyPasteEnhancementPlugin setCleanups={setCleanups} />
            <FAQPlugin />
            <TransformH4ToH2 />
            {/*<DefinitionListPlugin />*/}
            {/*<TreeViewPlugin />*/}
            {/*<AutoFocusPlugin/>*/}

            {import.meta.env.DEV && <TreeViewPlugin />}
          </Box>
        </Flex>

        <Stack flexDirection='row' justifyContent='space-between' style={{ width: '100%' }}>
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
