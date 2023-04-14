import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
	SELECTION_CHANGE_COMMAND,
	FORMAT_TEXT_COMMAND,
	FORMAT_ELEMENT_COMMAND,
	$getSelection,
	$isRangeSelection,
	$createParagraphNode,
	$getNodeByKey,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { LowPriority } from '../const';

function positionEditorElement(editor, rect) {

	if (rect === null) {
		editor.style.opacity = '0';
		editor.style.top = '-1000px';
		editor.style.left = '-1000px';
	} else {
		editor.style.opacity = '1';
		editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
		editor.style.left = `${
			rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
		}px`;
	}
}

const FloatingLinkEditor = ({ 
    editor,
    //setOpen,
    //open
}) => {

    //const selection = $getSelection();
    //console.log('ope12333', open);



	const editorRef = useRef(null);
	const inputRef = useRef(null);
	const mouseDownRef = useRef(false);
	//const [isEditMode, setEditMode] = useState(false);
	const [lastSelection, setLastSelection] = useState(null);
    //const [linkUrl, setLinkUrl] = useState({});
	const [linkTarget, setLinkTarget] = useState('');
    const [linkRel, setLinkRel] = useState('');
    const [link, setLink] = useState(null);

	const updateLinkEditor = useCallback(() => {

		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const parent = node.getParent();
			if ($isLinkNode(parent)) {
                setLink({
                    url: parent.getURL(),
                    target: parent.getTarget(),
                    rel: parent.getRel()
                })
			} else if ($isLinkNode(node)) {
                setLink({
                    url: node.getURL(),
                    target: node.getTarget(),
                    rel: node.getRel()
                })
			} else {
				setLink(null);
			}
		}
		const editorElem = editorRef.current;
		const nativeSelection = window.getSelection();
		const activeElement = document.activeElement;

		if (editorElem === null) {
			return;
		}

		const rootElement = editor.getRootElement();

		if (
			selection !== null &&
			!nativeSelection.isCollapsed &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode)
		) {
			const domRange = nativeSelection.getRangeAt(0);
			let rect;
			if (nativeSelection.anchorNode === rootElement) {
				let inner = rootElement;
				while (inner.firstElementChild != null) {
					inner = inner.firstElementChild;
				}
				rect = inner.getBoundingClientRect();
			} else {
				rect = domRange.getBoundingClientRect();
			}

			if (!mouseDownRef.current) {
				positionEditorElement(editorElem, rect);
			}
			setLastSelection(selection);
		} else if (!activeElement || activeElement.className !== 'link-input') {
			positionEditorElement(editorElem, null);
			setLastSelection(null);
			//setEditMode(false);
			//setLinkUrl('');
            setLink(null)
		}

		return true;
	}, [editor]);

	/*useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateLinkEditor();
				});
			}),

			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateLinkEditor();
					return true;
				},
				LowPriority
			)
		);
	}, [editor, updateLinkEditor]);*/

	useEffect(() => {
		editor.getEditorState().read(() => {
			updateLinkEditor();
		});
	}, [editor, updateLinkEditor]);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);


    console.log('link', link);

	return (
        <>
            <div ref={editorRef} className='link-editor'>
                <input
                    ref={inputRef}
                    type='text'
                    value={link?.url}
                    onChange={(event) => {
                        //setLinkUrl(event.target.value);
                        setLink((link) => ({
                            ...link,
                            url: event.target.value,
                        }));
                    
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            if (lastSelection !== null && link) {
                             
                                    /*editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                                        url: linkUrl,
                                        target: 'fooooo',
                                        rel: target === '_blank' ? 'noopener noreferrer' : null,
                                    });*/

                                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                                        ...link,
                                        rel: link.target === '_blank' ? 'noopener noreferrer' : null,
                                    });
                               
                            }
                        } else if (event.key === 'Escape') {
                            event.preventDefault();
                        }
                    }}
                />
                <div>
                    <label>
                        <input 
                            type='checkbox'
                            checked={link?.target === '_blank'}
                            onChange={(event) => {

                                console.log('event checked', event.target.checked);

                                setLink((link) => ({
                                    ...link,
                                    target: event.target.checked ? '_blank' : null,
                                }));
                            
                            }}
                        />
                        In neuem Fenster öffnen
                    </label>
                </div>
            </div>
        
        </>
	);
}

export default FloatingLinkEditor;