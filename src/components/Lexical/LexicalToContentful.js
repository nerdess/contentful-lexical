import Lexical from './Lexical';


const LexicalToContentful = ({ 
    initialValue,
    countChanges,
    sdk
 }) => {

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
					sdk.field.setValue(value);
					return;
				}
			}}
		/>
    )

};

export default LexicalToContentful;