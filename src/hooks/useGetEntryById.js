import { useState } from "react";


const useGetEntryById = () => {


    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false)
    const [entry, setEntry] = useState();

    

    return {
        isLoading,
        isError,
        entry
    }
}

export default useGetEntryById;