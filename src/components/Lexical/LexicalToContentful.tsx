import React, {RefObject} from 'react';
import Lexical from './Lexical';
//import { useSDK } from '@contentful/react-apps-toolkit';
//import { FieldAppSDK } from '@contentful/app-sdk';

interface LexicalToContentfulProps {
	initialValue: string;
	currentValue?: string;
	countChanges: any;		//countChanges: RefObject<number>;
	resizable?: boolean
	setValue: (value: string) => void;
}

const LexicalToContentful: React.FC<LexicalToContentfulProps> = ({
	initialValue,
	currentValue,
	countChanges,
	resizable,
	setValue,
}) => {

	//const sdk = useSDK<FieldAppSDK>();

	return (
		<Lexical
			initialValue={initialValue}
			resizable={resizable}
			setValue={(value: string): void => {

				countChanges.current = countChanges.current + 1;

				//incoming value is empty and current value is empty
				if (
					value === '<p></p>' &&
					(!currentValue || currentValue === '')
				) {
					return;
				}

				//incoming value is empty and current value is not empty
				if (value === '<p></p>') {
					//sdk.field.setValue();
					setValue('');
					return;
				}

				//it is not the initial value and incoming value is different to current value
				if (countChanges.current > 1 && value !== currentValue) {
					//console.log('prev', sdk.field.getValue());
					//console.log('next', value);
					//sdk.field.setValue(value);
					setValue(value);
					return;
				}
			}}
			
		/>
	);

};

export default LexicalToContentful;
