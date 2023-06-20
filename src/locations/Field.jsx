import { useSDK } from '@contentful/react-apps-toolkit';
import Lexical from '../components/Lexical/Lexical';
import { cleanup } from '../components/Lexical/helper';

const Field = () => {

	const sdk = useSDK();
	const window = sdk.window;

	window.startAutoResizer();

	const initialValue = cleanup(sdk.field.getValue()) || '';

	return (
		<Lexical
			initialValue={initialValue}
			setValue={(value) => {
				if (value !== sdk.field.getValue()) {
					sdk.field.setValue(value);
				}
			}}
		/>
	);
};

export default Field;
