import Lexical from './Lexical';
import { Button } from '@contentful/f36-components';

const LexicalToContentful = ({ 
    initialValue,
    countChanges,
    sdk
 }) => {

	/*
	
	are you doing something weird like onClick={sdk.field.openCurrentApp()} where it's calling inline or something?
it needs to be wrapped in a handler function like onClick={() => sdk.field.openCurrentApp()} for sure
	
	*/

    return (

        <Lexical
			initialValue={initialValue}
			setValue={(value) => {

				countChanges.current = countChanges.current + 1;
			
				//incoming value is empty and current value is empty
				if (value === '<p></p>' && (!sdk.field.getValue() || sdk.field.getValue() === '')) {
					return;
				};

				//incoming value is empty and current value is not empty
				if (value === '<p></p>') {
					sdk.field.setValue();
					return;
				}

				//it is not the initial value and incoming value is different to current value
				if (countChanges.current > 1 && value !== sdk.field.getValue()) {
					//console.log('prev', sdk.field.getValue());
					//console.log('next', value);
					sdk.field.setValue(value);
					return;
				}
			}}
		/>
	
    )

};

export default LexicalToContentful;