import { DialogAppSDK } from '@contentful/app-sdk';
import { Button, Flex, Modal, Stack } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useState, ReactNode, useRef, useEffect, forwardRef } from 'react';

import LexicalToContentful from '../LexicalToContentful';
import type {
  Cleanup,
  InvocationParameters_LexicalFullScreen,
} from '../plugins/copyPasteEnhancement/types';

// NOTE: forwarded ref wrapper for Modal.Header
const ForwardedModalHeader = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Modal.Header> & { children?: ReactNode }
>((props, ref) => (
  <div ref={ref} style={{ display: 'contents' }}>
    <Modal.Header {...props} />
  </div>
));

ForwardedModalHeader.displayName = 'ForwardedModalHeader';

const Wrapper = ({
  children,
  currentValue,
  cleanups,
  name = '',
}: {
  children: ReactNode;
  currentValue?: string;
  cleanups: Cleanup[];
  name?: string;
}) => {
  const sdk = useSDK<DialogAppSDK>();
  const [height, setHeight] = useState<string>('auto');
  const headerRef = useRef<HTMLDivElement>(null);
  const actionBarRef = useRef<HTMLDivElement>(null);

  useEffect(function calculateDynamicHeight() {
    updateHeight();

    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);

    function updateHeight() {
      try {
        const headerHeight = headerRef.current?.offsetHeight || 48;
        const actionBarHeight = actionBarRef.current?.offsetHeight || 48;
        const padding = 120;

        const totalFixedHeight = headerHeight + actionBarHeight + padding;

        const calculatedHeight = window.innerHeight - totalFixedHeight;

        setHeight(`${Math.max(calculatedHeight, 200)}px`);
      } catch (error) {
        console.error('Height calculation failed:', error);
        setHeight('500px');
      }
    }
  }, []);

  return (
    <Flex flexDirection='column' data-test-id='dialog-lexical-fullscreen'>
      <ForwardedModalHeader
        ref={headerRef}
        title='Fullscreen'
        subtitle={name}
        style={{ padding: '0.5rem', borderBottom: 'none' }}
      />
      <Modal.Content data-test-id='modal.content' style={{ padding: '0 1rem' }}>
        <Stack flexDirection='column' alignItems='end'>
          <Flex
            style={{
              width: '100%',
              height: height,
              minHeight: '200px',
              backgroundColor: 'transparent',
              transition: 'height 0.2s ease',
            }}
          >
            {children}
          </Flex>
          <Stack ref={actionBarRef} flexDirection='row' spacing='spacingS'>
            <Button
              variant='primary'
              onClick={() => {
                sdk.close({
                  value: currentValue,
                  cleanups,
                });
              }}
            >
              Close &amp; Save
            </Button>
          </Stack>
        </Stack>
      </Modal.Content>
    </Flex>
  );
};

const DialogLexicalFullScreen = ({
  invocationParams,
}: {
  invocationParams: InvocationParameters_LexicalFullScreen;
}) => {
  const { name, initialValue, cleanups } = invocationParams;
  const countChanges = useRef(0);
  const [currentValue, setCurrentValue] = useState<string>(initialValue);
  const [cleanupsState, setCleanupsState] = useState<Cleanup[]>(cleanups);

  return (
    <Wrapper name={name} currentValue={currentValue} cleanups={cleanupsState}>
      <LexicalToContentful
        initialValue={initialValue}
        currentValue={currentValue}
        countChanges={countChanges}
        setValue={setCurrentValue}
        resizable={false}
        cleanups={cleanupsState}
        setCleanups={setCleanupsState}
      />
    </Wrapper>
  );
};

export default DialogLexicalFullScreen;
