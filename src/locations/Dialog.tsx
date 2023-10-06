/*import React, { useRef } from 'react';
import { Paragraph } from '@contentful/f36-components';
import { DialogExtensionSDK } from '@contentful/app-sdk';
import { useCMA, useSDK } from '@contentful/react-apps-toolkit';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';*/
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from "@contentful/app-sdk";
import LexicalToContentful from '../components/Lexical/LexicalToContentful';


const Dialog = () => {

  const sdk = useSDK<DialogAppSDK>();
  const countChanges = useRef(0);

  console.log('foo', typeof(sdk.parameters.invocation))

  /*const {
    entryId,
    fieldId,
    countChanges
  } = sdk.parameters.invocation;*/

  //console.log('bar', entryId, fieldId, countChanges)
  return (
    <div style={{padding: 20}}>
      <LexicalToContentful
        initialValue={''}
        countChanges={countChanges}
        sdk={sdk} 
      />
  </div>
  )

};

export default Dialog;
