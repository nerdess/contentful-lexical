import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { mockCma, mockSdk } from '../../test/mocks';

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => mockSdk,
  useCMA: () => mockCma,
}));

import Dialog from './Dialog';

describe('Dialog component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Dialog />);

    expect(container).toBeDefined();
  });

  it('does not throw an error', () => {
    expect(() => render(<Dialog />)).not.toThrow();
  });
});
