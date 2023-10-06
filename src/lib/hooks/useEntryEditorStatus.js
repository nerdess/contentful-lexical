import { useEffect, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import useUser from './useUser';

const useEntryEditorStatus = ({ 
	showModal = false 
}) => {

	const sdk = useSDK();
	const [editorId, setEditorId] = useState(null);
	const [isPublished, setIsPublished] = useState(null);
	const [locked, setLocked] = useState(false);
	const { user: editor, isLoading, isError } = useUser(editorId);
	const showDialog = showModal && locked;

	useEffect(() => {
		sdk.entry.onSysChanged((sys) => {
			setEditorId(sys.updatedBy.sys.id);
			setIsPublished(sys.updatedAt === sys.publishedAt);
			setLocked(sdk.user.sys.id !== sys.updatedBy.sys.id && sys.updatedAt !== sys.publishedAt);
		});

		return () => {
			setEditorId(null);
			setIsPublished(null);
			setLocked(false);
		}
	}, [sdk]);

	useEffect(() => {

		if (showDialog) {

			//opens Dialog.tsx
			sdk.dialogs.openCurrentApp({
				shouldCloseOnOverlayClick: false,
				shouldCloseOnEscapePress: false,
				width: '34rem',
				minHeight: '16rem',
				parameters: {
					locked,
					entryId: sdk.ids.entry,
					editorId
				}
			});

		}

	}, [showDialog, sdk, locked, editorId]);

	return {
		isPublished,
		locked,
		editor,
		isLoading,
		isError,
	};
};

export default useEntryEditorStatus;
