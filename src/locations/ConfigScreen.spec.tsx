import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

import { mockCma, mockSdk } from '../../test/mocks';

import ConfigScreen from './ConfigScreen';

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

describe('Config Screen component', () => {
  it('Component text exists', async () => {
    render(<ConfigScreen />);

    await mockSdk.app.onConfigure.mock.calls[0][0]();

    /*expect(
      screen.getByText('Welcome to your contentful app. This is your config page.')
    ).toBeInTheDocument();*/
  });
});
