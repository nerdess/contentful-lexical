import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
  $createHeadingNode, HeadingTagType,
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


function dropDownActiveClass(active: boolean) {
    if (active) return 'active dropdown-item-active';
    else return '';
  }

const BlockFormatDropDown = ({
    editor,
    blockType,
    disabled = false,
  }:{
    editor: LexicalEditor,
    blockType: string,
    disabled?: boolean,
  }) => {

    const formatParagraph = () => {
      editor.update(() => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection)
        ) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    };
  
    const formatHeading = (headingSize: HeadingTagType) => {
      if (blockType !== headingSize) {
        editor.update(() => {
          const selection = $getSelection();
          if (
            $isRangeSelection(selection)
          ) {
            $setBlocksType(selection, () => $createHeadingNode(headingSize));
          }
        });
      }
    };
  
    const formatBulletList = () => {
      if (blockType !== 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    };
  
    /*const formatCheckList = () => {
      if (blockType !== 'check') {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    };*/
  
    const formatNumberedList = () => {
      if (blockType !== 'number') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      }
    };
  
    /*const formatQuote = () => {
      if (blockType !== 'quote') {
        editor.update(() => {
          const selection = $getSelection();
          if (
            $isRangeSelection(selection) ||
            DEPRECATED_$isGridSelection(selection)
          ) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
      }
    };
  
    const formatCode = () => {
      if (blockType !== 'code') {
        editor.update(() => {
          let selection = $getSelection();
  
          if (
            $isRangeSelection(selection) ||
            DEPRECATED_$isGridSelection(selection)
          ) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection = $getSelection();
              if ($isRangeSelection(selection))
                selection.insertRawText(textContent);
            }
          }
        });
      }
    };*/
  
    return (
      <DropDown
        disabled={disabled}
        buttonClassName="toolbar-item block-controls"
        buttonIconClassName={'icon block-type ' + blockType}
        buttonLabel={blockTypeToBlockName[blockType as keyof BlockTypeToBlockName]}
        buttonAriaLabel="Formatting options for text style">
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
          onClick={formatParagraph}>
          <i className="icon paragraph" />
          <span className="text">Normal</span>
        </DropDownItem>
        {/*<DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h1')}
          onClick={() => formatHeading('h1')}>
          <i className="icon h1" />
          <span className="text">Heading 1</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h3')}
          onClick={() => formatHeading('h3')}>
          <i className="icon h3" />
          <span className="text">Heading 3</span>
        </DropDownItem>*/}
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'bullet')}
          onClick={formatBulletList}>
          <i className="icon bullet-list" />
          <span className="text">Liste (einfach)</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'number')}
          onClick={formatNumberedList}>
          <i className="icon numbered-list" />
          <span className="text">Liste (nummeriert)</span>
        </DropDownItem>
        <hr />
        <DropDownHeader>Sonderformate</DropDownHeader>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h4')}
          onClick={() => formatHeading('h4')}>
          <i className="icon h4" />
          <span className="text ts-tpm-h4" style={{margin: 0}}>TPM H4</span>
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