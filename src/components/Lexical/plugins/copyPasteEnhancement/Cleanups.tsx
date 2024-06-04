import { Badge, Stack } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import './Cleanups.scss';
import { Cleanup } from './types';

const Cleanups = ({ cleanups }: { cleanups: Cleanup[] }) => {
	const sdk = useSDK();

	if (cleanups.length === 0) {
		return null;
	}

	return (
		<Stack spacing='spacing2Xs'>
			<Badge
				variant='secondary'
				className={`${cleanups.length > 0 ? 'cleanups--active' : ''}`}
				onClick={() => {
					cleanups.length > 0 &&
						sdk.dialogs.openCurrentApp({
							shouldCloseOnOverlayClick: true,
							shouldCloseOnEscapePress: true,
							//width: '34rem',
							minHeight: '100vh',
							parameters: {
								type: 'cleanups',
								cleanups,
							},
						});
				}}
			>
				Show cleanups
			</Badge>
		</Stack>
	);
};

export default Cleanups;
