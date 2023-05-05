/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useCallback, useMemo, useState} from 'react';
import * as React from 'react';

//import Modal from '../components/ui/Modal';
import { Modal, Button } from '@contentful/f36-components';

export default function useModal(): [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element) => void,
] {

  const [modalContent, setModalContent] = useState<null | {
    closeOnClickOutside: boolean;
    content: JSX.Element;
    title: string;
  }>(null);

  const onClose = useCallback(() => {
    setModalContent(null);
  }, []);

  const onOK = useCallback(() => {
    //setOK((prev) => !prev);
  }, []);

  //console.log('zzzz', ok);

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const {title, content, closeOnClickOutside} = modalContent;
    /*return (
      <Modal
        onClose={onClose}
        title={title}
        closeOnClickOutside={closeOnClickOutside}>
        {content}
      </Modal>
    );*/
    return (
      <Modal className="modal-image" onClose={onClose}  /*onClose={() => setShown(false)}*/ isShown={true}>
      {() => (
        <>
          <Modal.Header title={title} onClose={onClose} /*onClose={() => setShown(false)}*/ />
          <Modal.Content>
            {content}
          </Modal.Content>
          {/*<Modal.Controls>
              <Button
                size="small"
                variant="transparent"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="positive"
                onClick={onOK}
              >
                OK
              </Button>
            </Modal.Controls>*/}
          </>
      )}
      
    </Modal>
    )
  }, [modalContent, onClose]);

  const showModal = useCallback(
    (
      title: string,
      // eslint-disable-next-line no-shadow
      getContent: (
        onClose: () => void, 
        onOK: () => void
      ) => JSX.Element,
      closeOnClickOutside = false,
    ) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose, onOK),
        title,
      });
    },
    [onClose, onOK],
  );

  return [modal, showModal];
}
