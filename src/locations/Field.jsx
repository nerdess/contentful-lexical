import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import RichTextEditor from '../components/RichTextEditor/RichTextEditor';
import Lexical from '../components/Lexical/Lexical';

const Field = (props) => {

	const sdk = useSDK();
	const window = sdk.window;


	window.startAutoResizer();
 
	return <Lexical 
		initialValue={sdk.field.getValue()}
		setValue={(value) => sdk.field.setValue(value)}
	/>

	/*return <RichTextEditor 
				initialValue={sdk.field.getValue()}
				setValue={(value) => sdk.field.setValue(value)}  
	/>;*/
};

export default Field;