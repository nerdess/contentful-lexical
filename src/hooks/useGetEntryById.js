import { useState } from 'react';

const useGetEntryById = () => {
  const [isLoading] = useState(false);
  const [isError] = useState(false);
  const [entry] = useState();

  return {
    isLoading,
    isError,
    entry,
  };
};

export default useGetEntryById;
