import React from 'react';
import Lexical from './Lexical';
import { Cleanup } from './plugins/copyPasteEnhancement/types';

const LexicalToContentful = ({
	initialValue,
	currentValue,
	countChanges,
	setValue,
	cleanups,
	setCleanups,
	resizable = true
}:{
	initialValue: string;
	currentValue?: string;
	countChanges: any;
	setValue: (value: string) => void;
	cleanups: Cleanup[];
	setCleanups: React.Dispatch<React.SetStateAction<Cleanup[]>>;
	resizable?: boolean
}) => {

	return (
		<Lexical
			initialValue={initialValue}
			resizable={resizable}
			cleanups={cleanups}
			setCleanups={setCleanups}
			setValue={(value: string): void => {

				countChanges.current = countChanges.current + 1;

				//incoming value is empty
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
