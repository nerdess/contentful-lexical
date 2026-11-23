import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalProps,
  FormControl,
  FormLabel,
  TextInput,
  Textarea,
  Button,
  Flex,
  Text,
  Stack,
  Radio,
} from '@contentful/f36-components';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { QuoteStyle } from './types';

import { INSERT_QUOTE_COMMAND } from './index';

type QuoteModalProps = {
  isShown: boolean;
  onClose: () => void;
};

export default function QuoteModal({ isShown, onClose }: QuoteModalProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [quoteText, setQuoteText] = useState('');
  const [authorText, setAuthorText] = useState('');
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>('ts-quote-style-low-high');

  const quoteInputRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useTranslation();

  useEffect(
    function applyDelayedFocusOnShow() {
      if (isShown) {
        const timerId = setTimeout(() => {
          quoteInputRef.current?.focus();
        }, 100);

        return () => clearTimeout(timerId);
      }
    },
    [isShown]
  );

  const validateFields = () => {
    let isValid = true;
    const trimmedQuote = quoteText.trim();
    const trimmedAuthor = authorText.trim();

    if (!trimmedQuote) {
      setQuoteError(t('editor.citation.quoteRequired'));
      isValid = false;
    } else {
      setQuoteError(null);
    }

    if (!trimmedAuthor) {
      setAuthorError(t('editor.citation.authorRequired'));
      isValid = false;
    } else {
      setAuthorError(null);
    }

    return isValid;
  };

  const handleQuoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuoteText(e.target.value);
    if (hasAttemptedSubmit && e.target.value.trim()) {
      setQuoteError(null);
    }
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthorText(e.target.value);
    if (hasAttemptedSubmit && e.target.value.trim()) {
      setAuthorError(null);
    }
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    // NOTE: prevent default browser form submission (which causes page reload)
    e?.preventDefault();

    setHasAttemptedSubmit(true);

    if (!validateFields()) {
      return;
    }

    editor.update(() => {
      editor.dispatchCommand(INSERT_QUOTE_COMMAND, {
        quoteText: quoteText.trim(),
        authorText: authorText.trim(),
        quoteStyle,
      });
    });

    resetFormState();
    onClose();
  };

  const resetFormState = () => {
    setQuoteText('');
    setAuthorText('');
    setHasAttemptedSubmit(false);
    setQuoteError(null);
    setAuthorError(null);
  };

  const handleClose = () => {
    onClose();
    resetFormState();
  };

  const modalProps: Omit<ModalProps, 'children'> = {
    isShown,
    onClose: handleClose,
  };

  const modalTitle = t('editor.citation.title');
  const submitButtonText = t('editor.citation.add');

  return (
    <Modal className='ts-quote-modal' {...modalProps}>
      {() => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader title={modalTitle} style={{ paddingTop: '4px', paddingBottom: '4px' }} />
          <ModalContent>
            <FormControl isInvalid={!!quoteError} marginBottom='spacingM'>
              <FormLabel htmlFor='quote'>{t('editor.citation.quoteText')}</FormLabel>
              <Textarea
                id='quote'
                name='quote'
                value={quoteText}
                onChange={handleQuoteChange}
                rows={3}
                placeholder={t('editor.citation.quoteTextPlaceholder')}
                ref={quoteInputRef}
                aria-required='true'
                aria-invalid={!!quoteError}
              />
              {quoteError && (
                <Text
                  fontColor='red600'
                  fontSize='fontSizeS'
                  marginTop='spacingXs'
                  aria-live='polite'
                >
                  {quoteError}
                </Text>
              )}
            </FormControl>
            <FormControl isInvalid={!!authorError} marginBottom='spacingM'>
              <FormLabel htmlFor='author'>{t('editor.citation.author')}</FormLabel>
              <TextInput
                id='author'
                name='author'
                value={authorText}
                onChange={handleAuthorChange}
                placeholder={t('editor.citation.authorPlaceholder')}
                aria-required='true'
                aria-invalid={!!authorError}
              />
              {authorError && (
                <Text
                  fontColor='red600'
                  fontSize='fontSizeS'
                  marginTop='spacingXs'
                  aria-live='polite'
                >
                  {authorError}
                </Text>
              )}
            </FormControl>
            <FormControl marginBottom='none'>
              <FormLabel htmlFor='quoteStyle'>{t('editor.citation.quoteStyle')}</FormLabel>
              <Stack flexDirection='row'>
                <Radio
                  id='radio1'
                  name='radio-controlled'
                  value='yes'
                  isChecked={quoteStyle === 'ts-quote-style-low-high'}
                  onChange={() => setQuoteStyle('ts-quote-style-low-high')}
                >
                  <i className='icon quotation-marks'></i>
                </Radio>
                <Radio
                  id='radio2'
                  name='radio-controlled'
                  value='no'
                  isChecked={quoteStyle === 'ts-quote-style-high'}
                  onChange={() => setQuoteStyle('ts-quote-style-high')}
                >
                  <i className='icon quotation-marks-top'></i>
                </Radio>
              </Stack>
            </FormControl>
          </ModalContent>
          <Flex justifyContent='space-between' padding='spacingL'>
            <Button variant='secondary' onClick={handleClose} type='button'>
              {t('editor.citation.cancel')}
            </Button>
            <Button variant='primary' type='submit'>
              {submitButtonText}
            </Button>
          </Flex>
        </form>
      )}
    </Modal>
  );
}
