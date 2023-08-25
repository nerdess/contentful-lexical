import React, { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import Lexical from '../components/Lexical/Lexical';
import useAutoResizer from '../hooks/useAutoResizer';
import { cleanup } from '../components/Lexical/helper';

const Field = () => {

	const sdk = useSDK();
	const countChanges = useRef(0);
	const initialValue = sdk.field.getValue();

	useAutoResizer();

	return (
		<Lexical
			initialValue={initialValue}
			setValue={(value) => {

				//setCountChanges((prev) => prev + 1);
				countChanges.current = countChanges.current + 1;
			
				//incoming value is empty and current value is empty
				if (value === '<p></p>' && (!sdk.field.getValue() || sdk.field.getValue() === '')) {
					//console.log('setting A');
					return;
				};

				//incoming value is empty and current value is not empty
				if (value === '<p></p>') {
					//console.log('setting C')
					sdk.field.setValue();
					return;
				}

				//it is not the initial value and incoming value is different to current value
				if (countChanges.current > 1 && value !== sdk.field.getValue()) {
					console.log('setting D');
					console.log('value', value)
					sdk.field.setValue(value);
					return;
				}
			}}
		/>
	);
};

export default Field;
