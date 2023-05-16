import { useCallback, useEffect, useRef, useState } from 'react';
import {
	$getSelection,
	$isRangeSelection,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getSelectedNode } from '../../utils/getSelectedNode';

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
    editor
}) => {

	const editorRef = useRef(null);
	const inputRef = useRef(null);
	const mouseDownRef = useRef(false);
	const [lastSelection, setLastSelection] = useState(null);
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
            setLink(null)
		}

		return true;
	}, [editor]);

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

	return (
        <>
            <div ref={editorRef} className='link-editor'>
                <input
                    ref={inputRef}
                    type='text'
                    value={link?.url}
                    onChange={(event) => {
                        setLink((link) => ({
                            ...link,
                            url: event.target.value,
                        }));                   
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            if (lastSelection !== null && link) {

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