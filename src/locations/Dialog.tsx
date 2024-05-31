import React, { useState, ReactNode } from 'react';
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';
import { InvocationParameters } from './Field';
import {
	Button,
	Flex,
	Modal,
	Note,
	Stack,
} from '@contentful/f36-components';

const Wrapper = ({
	children,
	name = '',
	currentValue,
} : { 
	children: ReactNode; 
	name?: string;
	currentValue?: string;
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
					<Flex
						style={{
							width: '100%',
							height: 'calc(100vh - 48px - 48px - 49px - 142px)' //todo: calculate dynamically
						}}
					>
						{children}
					</Flex>
					<Stack 
						flexDirection='row' 
						spacing='spacingS'
					>
						<Note
							variant='warning'
							style={{
								maxHeight: 74,
								overflow: 'auto'
							}}
						>
							Please note: In fullscreen-mode changes are <strong>not saved automatically</strong>!<br />
							To auto-save hit the 'Close & Save'-Button ➡️&nbsp;➡️&nbsp;➡️ 
						</Note>
						<Button
							variant="primary"
							onClick={() => {

									sdk.close({
										value: currentValue
									})
								}
							}
						>
							Close & Save
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
	const [currentValue, setCurrentValue] = useState<string>(initialValue);

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
