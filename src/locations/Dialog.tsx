import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';

import DialogCleanup from '../components/Lexical/dialogs/DialogCleanup';
import DialogLexicalFullScreen from '../components/Lexical/dialogs/DialogLexicalFullScreen';
import type {
  InvocationParameters_Cleanup,
  InvocationParameters_LexicalFullScreen,
} from '../components/Lexical/plugins/copyPasteEnhancement/types';

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const invocationParams = sdk.parameters.invocation as
    | InvocationParameters_LexicalFullScreen
    | InvocationParameters_Cleanup;
  const { type } = invocationParams;

  if (type === 'lexicalFullScreen') {
    return <DialogLexicalFullScreen invocationParams={invocationParams} />;
  }

  if (type === 'cleanups') {
    return <DialogCleanup invocationParams={invocationParams} />;
  }

  return null;
};

export default Dialog;
