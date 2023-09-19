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

	return (
		<>
			{/*<Button
				onClick={() => {sdk.dialogs.openCurrentApp()}}
			>
				Open Dialog
			</Button>*/}
			<LexicalToContentful
				initialValue={initialValue}
				countChanges={countChanges}
				sdk={sdk} 
			/>
		</>
	);
};

export default Field;
