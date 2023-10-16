import React, { useState, ReactNode } from 'react';
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';
import { InvocationParameters } from './Field';
import {
	Box,
	Button,
	Flex,
	Modal,
	Note,
	Stack,
} from '@contentful/f36-components';

const Wrapper: React.FC<{
	name?: string;
	children?: ReactNode;
	currentValue?: string;
}> = ({ 
	name = '',
	children, 
	currentValue, 
 }) => {

	const sdk = useSDK<DialogAppSDK>();

	return (
		<Flex flexDirection='column'>
			<Modal.Header title='Fullscreen' subtitle={name} />
			<Modal.Content>
				<Stack
					flexDirection='column'
					alignItems='end'
				>
					<Box style={{width: '100%'}}>
						<Note
							variant='warning'
						>
							Please note: In fullscreen-mode any changes are <strong>not saved automatically</strong>!<br />To auto-save or publish you need to close this dialog. Upon closing, any changes will be transferred to the original field. ✨
						</Note>
					</Box>
					<Flex
						style={{
							width: '100%',
							height: 'calc(100vh - 48px - 48px - 49px - 190px)' //todo: calculate dynamically
						}}
					>
						{children}
					</Flex>
					<Stack flexDirection='row' spacing='spacingS'>
						<Button
							variant='secondary'
							onClick={() => {

									sdk.close({
										value: currentValue
									})
								}
							}
						>
							Close
						</Button>
					</Stack>
				</Stack>
			</Modal.Content>
		</Flex>
	);
};

const Dialog = () => {
	const sdk = useSDK<DialogAppSDK>();
	const invocationParams: InvocationParameters = sdk.parameters.invocation as any;
	const { name, initialValue } = invocationParams;
	const countChanges = useRef(0);
	const [currentValue, setCurrentValue] = useState<string | undefined>(initialValue);

	return (
		<Wrapper
			name={name}
			currentValue={currentValue}
		>
			<LexicalToContentful
				initialValue={initialValue}
				currentValue={currentValue}
				countChanges={countChanges}
				setValue={setCurrentValue}
				resizable={false}
			/>
		</Wrapper>
	);
};

export default Dialog;
