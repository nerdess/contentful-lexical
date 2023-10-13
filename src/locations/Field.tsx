import React, {useState, useEffect, RefObject} from 'react';
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import useAutoResizer from '../hooks/useAutoResizer';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';
import { Box, Button, Stack } from '@contentful/f36-components';
import { FieldAppSDK, SerializedJSONValue } from '@contentful/app-sdk';
//import { cleanup } from '../components/Lexical/helper';
//import { Icon } from '@contentful/f36-components';
//import FullScreenIcon from './src/images/icons/full-screen.svg';
//const svg = '<svg width="800" height="800" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4 12V4h8m8 0h8v8M4 20v8h8m16-8v8h-8"/></svg>'

export interface InvocationParameters {
	ids: { 
	  space: string; 
	  environment: string; 
	  entry: string; 
	  field: string 
	};
	locale: string;
	name: string;
	initialValue: string;
}

const Field: React.FC = () => {

	useAutoResizer();
	const sdk = useSDK<FieldAppSDK>();
	const countChanges = useRef<number>(0);
	//const initialValue = sdk.field.getValue();
	const [initialValue, setInitialValue] = useState(sdk.field.getValue());
	//const [overlayValue, setOverlayValue] = useState<string | undefined>();

	const setValue = (value: string) => {
		sdk.field.setValue(value);
	};

	return (
		<Stack 
			//style={{width: '100%', background: 'red'}}
			fullWidth
			flexDirection="column" 
			spacing="spacing2Xs" 
			alignItems="end"
		>
			<Box>
				<Button
					size="small"
					//endIcon={<Icon><path d="M4 12V4h8m8 0h8v8M4 20v8h8m16-8v8h-8"/></Icon>}
					
					onClick={
						() => {

							const parameters: InvocationParameters = {
								ids: sdk.ids,
								locale: sdk.field.locale,
								name: sdk.field.name,
								initialValue: sdk.field.getValue()
							};

							sdk.dialogs.openCurrentApp({
								width: 'fullWidth',
								minHeight: '100vh',
								parameters: parameters as unknown as SerializedJSONValue
							}).then(({value}) => {

								setInitialValue(value);
		
							})


						}
					
					}
				>
					Fullscreen
				</Button>
			</Box>
			<Box style={{width: '100%'}}>
				<LexicalToContentful
					initialValue={initialValue}
					currentValue={sdk.field.getValue()}
					countChanges={countChanges}
					setValue={setValue}
				/>
			</Box>
		</Stack>
	);
};

export default Field;
