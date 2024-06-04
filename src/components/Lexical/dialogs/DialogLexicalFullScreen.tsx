import { useState, ReactNode } from 'react';
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import LexicalToContentful from '../LexicalToContentful';
import {
	Button,
	Flex,
	Modal,
	Note,
	Stack,
} from '@contentful/f36-components';
import { Cleanup, InvocationParameters_LexicalFullScreen } from '../plugins/copyPasteEnhancement/types';

const Wrapper = ({
	children,
	currentValue,
	cleanups,
	name = ''
} : { 
	children: ReactNode; 
	currentValue?: string;
	cleanups: Cleanup[];
	name?: string;
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
										value: currentValue,
										cleanups
									})
								}
							}
						>
							Close &amp; Save
						</Button>
					</Stack>
				</Stack>
			</Modal.Content>
		</Flex>
	);
};


const DialogLexicalFullScreen = ({
    invocationParams
}:{
    invocationParams: InvocationParameters_LexicalFullScreen;
}) => {

    const { name, initialValue, cleanups } = invocationParams;
	const countChanges = useRef(0);
	const [currentValue, setCurrentValue] = useState<string>(initialValue);
	const [cleanupsState, setCleanupsState] = useState<Cleanup[]>(cleanups);

	return (
		<Wrapper
			name={name}
			currentValue={currentValue}
			cleanups={cleanupsState}
		>
			<LexicalToContentful
				initialValue={initialValue}
				currentValue={currentValue}
				countChanges={countChanges}
				setValue={setCurrentValue}
				resizable={false}
				cleanups={cleanupsState}
				setCleanups={setCleanupsState}
			/>
		</Wrapper>
	);


};

export default DialogLexicalFullScreen;