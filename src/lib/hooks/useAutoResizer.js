import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';

const useAutoResizer = () => {
  const sdk = useSDK();
  const window = sdk.window;

  useEffect(() => {
    window.startAutoResizer();
    return () => window.stopAutoResizer();
  }, [window]);
};

export default useAutoResizer;
