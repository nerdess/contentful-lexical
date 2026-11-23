import { fireEvent, render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { mockCma, mockSdk } from '../../test/mocks';

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

import Field from './Field';

describe('Field component', () => {
  it('renders the editor with toolbar', () => {
    const { getByRole } = render(<Field />);

    expect(getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the fullscreen button', () => {
    const { getByText } = render(<Field />);

    expect(getByText('Fullscreen')).toBeInTheDocument();
  });

  it('renders toolbar buttons', () => {
    const { getByTitle } = render(<Field />);

    expect(getByTitle('editor.styles.bold')).toBeInTheDocument();
    expect(getByTitle('editor.styles.italic')).toBeInTheDocument();
  });

  describe('fullscreen dialog', () => {
    beforeEach(() => {
      mockSdk.field.setValue.mockClear();
      mockSdk.dialogs.openCurrentApp.mockReset();
    });

    it('does nothing when the dialog is closed without saving', async () => {
      mockSdk.dialogs.openCurrentApp.mockResolvedValue(undefined);
      const { getByText } = render(<Field />);

      fireEvent.click(getByText('Fullscreen'));

      await waitFor(() => expect(mockSdk.dialogs.openCurrentApp).toHaveBeenCalled());
      await Promise.resolve();
      expect(mockSdk.field.setValue).not.toHaveBeenCalledWith('<p>from dialog</p>');
    });

    it('saves the value returned by the dialog', async () => {
      mockSdk.dialogs.openCurrentApp.mockResolvedValue({ value: '<p>from dialog</p>', cleanups: [] });
      const { getByText } = render(<Field />);

      fireEvent.click(getByText('Fullscreen'));

      await waitFor(() => expect(mockSdk.field.setValue).toHaveBeenCalledWith('<p>from dialog</p>'));
      expect(mockSdk.dialogs.openCurrentApp).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 'fullWidth',
          parameters: expect.objectContaining({ type: 'lexicalFullScreen' }),
        })
      );
    });
  });
});
