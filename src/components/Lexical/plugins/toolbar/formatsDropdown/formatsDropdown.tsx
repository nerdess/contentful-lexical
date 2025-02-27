import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
  $createHeadingNode, 
  HeadingTagType,
  $createQuoteNode
} from '@lexical/rich-text';
import {
  $setBlocksType,
} from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from 'lexical';
//import DropDown, {DropDownItem} from '../../ui/DropDown';
import DropDown, {DropDownItem, DropDownHeader} from '../../../../ui/DropDown';
import { BlockTypeToBlockName, blockTypeToBlockName } from './const';
import { clearFormatting } from '../../../../../lib/utils/clearFormatting';

const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
};

const formatHeading = (
  editor: LexicalEditor,
  blockType: string,
  headingSize: HeadingTagType,
) => {
  if (blockType !== headingSize) {
    editor.update(() => {
      const selection = $getSelection();
      clearFormatting(editor);
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    });
  }
};

const formatBulletList = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'bullet') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }
};

const formatNumberedList = (
  editor: LexicalEditor,
  blockType: string,
) => {
  if (blockType !== 'number') {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }
};
  
const formatQuote = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'quote') {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createQuoteNode());
    });
  }
};

const dropDownActiveClass = (active: boolean) => {
    if (active) return 'active dropdown-item-active';
    else return '';
};

const BlockFormatDropDown = ({
    editor,
    blockType,
    disabled = false,
  }:{
    editor: LexicalEditor,
    blockType: string,
    disabled?: boolean,
  }) => {
  
    return (
      <DropDown 
        disabled={disabled}
        buttonClassName="toolbar-item block-controls"
        buttonIconClassName={'icon block-type ' + blockType}
        buttonLabel={blockTypeToBlockName[blockType as keyof BlockTypeToBlockName]}
        buttonAriaLabel="Formatting options for text style">
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
          onClick={() => formatParagraph(editor)}>
          <i className="icon paragraph" />
          <span className="text">Normal</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'bullet')}
          onClick={() => formatBulletList(editor, blockType)}>
          <i className="icon bullet-list" />
          <span className="text">Liste (einfach)</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'number')}
          onClick={() => formatNumberedList(editor, blockType)}>
          <i className="icon numbered-list" />
          <span className="text">Liste (nummeriert)</span>
        </DropDownItem>
        <DropDownItem
          className={'item wide ' + dropDownActiveClass(blockType === 'quote')}
          onClick={() => formatQuote(editor, blockType)}>
          <i className="icon quote" />
          <span className="text">Zitat</span>
        </DropDownItem>
        <hr />
        <DropDownHeader>Sonderformate</DropDownHeader>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h2')}
          onClick={() => formatHeading(editor, blockType, 'h2')}>
          <i className="icon h2" />
          <span className="text ts-tpm-h2" style={{margin: 0}}>Zwischenüberschrift</span>
        </DropDownItem>
        {/* <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'check')}
          onClick={formatCheckList}>
          <i className="icon check-list" />
          <span className="text">Check List</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'quote')}
          onClick={formatQuote}>
          <i className="icon quote" />
          <span className="text">Quote</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'code')}
          onClick={formatCode}>
          <i className="icon code" />
          <span className="text">Code Block</span>
        </DropDownItem>*/}
      </DropDown>
    );
}

export default BlockFormatDropDown;