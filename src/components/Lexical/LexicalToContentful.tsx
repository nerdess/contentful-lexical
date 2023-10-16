import React from 'react';
import Lexical from './Lexical';

interface LexicalToContentfulProps {
	initialValue: string;
	currentValue?: string;
	countChanges: any;
	setValue: (value: string) => void;
	resizable?: boolean
}

const LexicalToContentful: React.FC<LexicalToContentfulProps> = ({
	initialValue,
	currentValue,
	countChanges,
	setValue,
	resizable
}) => {

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
					setValue('');
					return;
				}

				//it is not the initial value and incoming value is different to current value
				if (countChanges.current > 1 && value !== currentValue) {
					setValue(value);
					return;
				}
			}}
			
		/>
	);

};

export default LexicalToContentful;
