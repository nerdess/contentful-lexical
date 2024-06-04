import {
	Button,
	Flex,
	Modal,
	Stack,
} from "@contentful/f36-components";
import {
	Cleanup,
	InvocationParameters_Cleanup,
} from "../plugins/copyPasteEnhancement/types";
import { useSDK } from "@contentful/react-apps-toolkit";
import { DialogAppSDK } from "@contentful/app-sdk";
import { StringDiff } from "react-string-diff";

const DialogCleanup = ({
	invocationParams,
}: {
	invocationParams: InvocationParameters_Cleanup;
}) => {
	const sdk = useSDK<DialogAppSDK>();
	const { cleanups } = invocationParams;
	const _cleanups = [...cleanups].reverse();

	return (
		<Flex flexDirection="column" style={{ height: "100vh" }}>
			<Modal.Header
                title="Cleanups (on copy-paste)"
                subtitle="Since last document opening, latest on top"
            />
			<Modal.Content>
				<Stack flexDirection="column" alignItems="end">
					<Flex
						style={{
                            width: "100%",
							height: "calc(100vh - 253px)", //todo: calculate dynamically
						}}
						flexDirection="column"
                        gap="spacingS"
					>
						{_cleanups.map((cleanup: Cleanup, index: number) => {
							return (
                                <StringDiff
                                    key={index}
                                    oldValue={cleanup.original}
                                    newValue={cleanup.cleaned}
                                />
							);
						})}
					</Flex>
				</Stack>
			</Modal.Content>
			<Modal.Controls>
				<Button
					onClick={() => sdk.close()}
				>
					OK
				</Button>
			</Modal.Controls>
		</Flex>
	);
};

export default DialogCleanup;
