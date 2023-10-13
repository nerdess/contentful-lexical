import React, { useEffect, useState, ReactNode } from 'react';
import { useRef } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { DialogAppSDK } from '@contentful/app-sdk';
import LexicalToContentful from '../components/Lexical/LexicalToContentful';
import { EntryProps, KeyValueMap } from 'contentful-management';
import { InvocationParameters } from './Field';
import {
  Badge,
  Box,
	Button,
	Flex,
	Modal,
	Note,
	Spinner,
	Stack,
} from '@contentful/f36-components';
import { useDebounce, useEventListener } from 'usehooks-ts';
//import tokens from '@contentful/f36-tokens';

const Wrapper: React.FC<{ 
  name?: string,
  children?: ReactNode,
  currentValue?: string,
  isErrorAutoSave?: boolean
}> = ({ 
  name = '',
  children,
  currentValue,
  isErrorAutoSave = false
 }) => {

	const sdk = useSDK<DialogAppSDK>();
	const ref = useRef();
	const [editorInnerHeight, setEditorInnerHeight] = useState();

	/*useEventListener('resize', () => {
		console.log('height1', ref.current.clientHeight)
		setEditorInnerHeight(ref.current.clientHeight)
	})*/ 

	return (
    <Flex flexDirection="column">
      <Box>
        {isErrorAutoSave && <Badge 
          variant="negative"
          style={{position:'absolute', right: 24, top: 18}}
        >
          Auto-Saving failed, please save manually
        </Badge>
        }
      </Box>
      <Modal.Header title="Fullscreen" subtitle={name} />
      <Modal.Content>
        <Stack
          flexDirection="column"
          alignItems="end"
          style={{
            //height: 'calc(100vh - 48px - 48px - 90px)'
          }}
        >
          <Flex style={{width: '100%', /*flex: 1,*/ height:  'calc(100vh - 48px - 48px - 150px)'}}>
            {children}
          </Flex>
          <Stack flexDirection="row" spacing="spacingS">
            <Button variant="primary" onClick={() => sdk.close((currentValue !== undefined) && { value: currentValue })}>
              Close
            </Button>
          </Stack>
        </Stack>
      </Modal.Content>
    </Flex>
  )
};

const Dialog = () => {

	const sdk = useSDK<DialogAppSDK>();
	const countChanges = useRef(0);
	const invocationParams: InvocationParameters = sdk.parameters.invocation as any;
	const [entry, setEntry] = useState<EntryProps<KeyValueMap>>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
  const [isErrorAutoSave, setIsErrorAutoSave] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string | undefined>(undefined);
	const debouncedValue = useDebounce<string | undefined>(currentValue, 1000);
	const { ids, locale, name, initialValue } = invocationParams;


	useEffect(() => {
		sdk.cma.entry
			.get({
				spaceId: ids.space,
				environmentId: ids.environment,
				entryId: ids.entry,
			})
			.then((e) => {
				setEntry(e);
				//setInitialValue(e?.fields[ids.field][locale]);
				setIsLoading(false);
			})
			.catch((e) => {
				setIsError(true);
				setIsLoading(false);
			});
	}, [ids.space, ids.environment, ids.entry, sdk.cma.entry, ids.field, locale]);


	useEffect(() => {
		if (entry && debouncedValue) {
			if (entry?.fields[ids.field][locale] !== debouncedValue) {
				// set new value on object
				entry.fields[ids.field][locale] = debouncedValue;
				// make cma call to write value to localized field on the entry
				sdk.cma.entry
					.update(
						{
							spaceId: ids.space,
							environmentId: ids.environment,
							entryId: ids.entry,
						},
						{
							sys: entry.sys,
							fields: entry.fields,
						}
					)
					.then((e) => {
						setEntry(e);
					})
          .catch((e)=> {
            setIsErrorAutoSave(true);
          });
			}
		}
	}, [
		debouncedValue,
		entry,
		ids.environment,
		ids.entry,
		ids.field,
		ids.space,
		locale,
		sdk.cma.entry,
	]);

	if (isLoading) {
		return (
			<Wrapper name={name}>
				<Spinner variant='default' />
			</Wrapper>
		);
	}

	if (isError) {
		return (
			<Wrapper name={name}>
				<Note variant='negative'>
					Vollbildmodus konnte nicht geladen werden.
				</Note>
			</Wrapper>
		);
	}

	return (
		<Wrapper name={name} currentValue={currentValue} isErrorAutoSave={isErrorAutoSave}>
			<LexicalToContentful
				initialValue={initialValue}
				currentValue={currentValue}
				countChanges={countChanges}
				setValue={setCurrentValue}
        resizable={false}
			/>
		</Wrapper>
	);
};

export default Dialog;
