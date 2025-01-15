import {useState, useCallback} from 'react';
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import useAutoResizer from '../hooks/useAutoResizer';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';
import { Box, Button, Stack } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { Cleanup, InvocationParameters_LexicalFullScreen } from '../components/Lexical/plugins/copyPasteEnhancement/types';



const Field = () => {

	useAutoResizer();
	const sdk = useSDK<FieldAppSDK>();
	const countChanges = useRef<number>(0);
	const [initialValue, setInitialValue] = useState(sdk.field.getValue());
	const [cleanups, setCleanups] = useState<Cleanup[]>([]);

	const setValue = useCallback((value: string) => {
		sdk.field.setValue(value);
	}, [sdk.field]);

	console.log('initialValue', initialValue);

	return (
		<Stack 
			fullWidth
			flexDirection="column" 
			spacing="spacing2Xs" 
			alignItems="end"
		>
			<Box>
				<Button
					size="small"
					
					onClick={
						() => {

							const initialValue = sdk.field.getValue();
	
							const parameters: InvocationParameters_LexicalFullScreen = {
								type: 'lexicalFullScreen',
								ids: sdk.ids,
								locale: sdk.field.locale,
								name: sdk.field.name,
								initialValue,
								cleanups
							};

							sdk.dialogs.openCurrentApp({
								width: 'fullWidth',
								minHeight: '100vh',
								parameters
							}).then(({value, cleanups}) => {

								if (value !== initialValue) {
									setInitialValue(value);
									setValue(value);
									setCleanups(cleanups);
								}
		
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
					cleanups={cleanups}
					setCleanups={setCleanups}
				/>
			</Box>
		</Stack>
	);
};

export default Field;
