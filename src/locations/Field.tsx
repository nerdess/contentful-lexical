import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import useAutoResizer from '../hooks/useAutoResizer';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';
//import { cleanup } from '../components/Lexical/helper';
import { Button } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';

const Field = () => {

	const sdk = useSDK<FieldAppSDK>();
	const countChanges = useRef(0);
	const initialValue = sdk.field.getValue();

	useAutoResizer();

	console.log('xxx', sdk);

	return (
		<>
			{<Button
				onClick={() => sdk.dialogs.openCurrentApp({
					width: 'fullWidth',
					minHeight: '100vh',
					parameters: {
						entryId: sdk.entry.getSys().id,
						fieldId: sdk.field.id,
						countChanges: countChanges.current
					}
				})}
			>
				Open Dialog
			</Button>}
			<LexicalToContentful
				initialValue={initialValue}
				countChanges={countChanges}
				sdk={sdk} 
			/>
		</>
	);
};

export default Field;
