import React from 'react';
import { Paragraph, Textarea} from '@contentful/f36-components';
//import { LocationField } from '@contentful/f36-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

interface LocationFieldProps {
  sdk: FieldExtensionSDK;
}

const Field = () => {
  const sdk = useSDK<FieldExtensionSDK>();

  //console.log('Field props', props, sdk);
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  // If you only want to extend Contentful's default editing experience
  // reuse Contentful's editor components
  // -> https://www.contentful.com/developers/docs/extensibility/field-editors/
  //<Paragraph>Hello Entry Field Component (AppId: {sdk.ids.app})</Paragraph>
  return (

      <Textarea />
    
  )
};

export default Field;
