/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useCallback, useMemo, useState} from 'react';
import { Modal } from '@contentful/f36-components';

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

  const onOK = useCallback(() => {}, []);


  const modal = useMemo(() => {
    if (modalContent === null) {
      return null;
    }
    const {title, content} = modalContent;
    return (
      <Modal className="modal-image" onClose={onClose} isShown={true}>
      {() => (
        <>
          <Modal.Header title={title} onClose={onClose} />
          <Modal.Content>
            {content}
          </Modal.Content>
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
