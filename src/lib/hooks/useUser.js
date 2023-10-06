import { useEffect, useState } from 'react';
import useCMA from './useCMA';

const useUser = (id) => {

	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isError, setIsError] = useState(false);

	const {
		space
	} = useCMA();

	useEffect(() => {

		if (!space || !id) return;

        setIsLoading(true);

		space.getSpaceUser(id).then((user) => {
			setUser(user);
            setIsLoading(false);
		}).catch((error) => {
            setIsError(true);
            setIsLoading(false);
        });

		return () => {
			setIsLoading(false);
			setIsError(false);
            setUser(null);
		};
	}, [space, id]);

	return {
		user,
		isLoading,
		isError,
	};
};

export default useUser;
