import React, { useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import Lexical from '../components/Lexical/Lexical';
import useAutoResizer from '../hooks/useAutoResizer';
import { cleanup } from '../components/Lexical/helper';

const Field = () => {

	const sdk = useSDK();

	const [isInitialised, setIsInitialised] = useState(false);
	const [initalContentHasBeenTransformed, setInitalContentHasBeenTransformed] = useState(false);

	//const initialValue = useRef(cleanup(sdk.field.getValue()));

	const initialValue = cleanup(sdk.field.getValue());

	console.log('initalContentHasBeenTransformed', initalContentHasBeenTransformed);

	useAutoResizer();

	return (
		<Lexical
			initialValue={initialValue}
			initalContentHasBeenTransformed={initalContentHasBeenTransformed}
			setValue={(value) => {

				console.log('current value', sdk.field.getValue());
				console.log('incoming value', value);
			

				//incoming value is empty and current value is empty
				if (value === '<p></p>' && (!sdk.field.getValue() || sdk.field.getValue() === '')) {
					console.log('setting A');
					setIsInitialised(true)
				};

				if (value === initialValue) {
					console.log('setting B');
					setIsInitialised(true)
					return;
				}

				//incoming value is empty and current value is not empty
				if (value === '<p></p>') {
					setIsInitialised(true);
					console.log('setting C')
					//sdk.field.setValue();
					return;
				}

				//incoming value is different to current value
				if (value !== sdk.field.getValue()) {
					console.log('setting D');
					//sdk.field.setValue(value);

					if (!isInitialised) {
						setInitalContentHasBeenTransformed(true);	
					}

					setIsInitialised(true);
				}
			}}
		/>
	);
};

export default Field;
