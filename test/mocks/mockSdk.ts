import { vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSdk: any = {
  app: {
    onConfigure: vi.fn(),
    getParameters: vi.fn().mockReturnValue({}),
    setReady: vi.fn(),
    getCurrentState: vi.fn(),
  },
  ids: {
    app: 'test-app',
  },
  parameters: {
    invocation: {},
  },
  field: {
    getValue: vi.fn().mockReturnValue(''),
    setValue: vi.fn(),
    onValueChanged: vi.fn(),
    removeValue: vi.fn(),
  },
  window: {
    startAutoResizer: vi.fn(),
    stopAutoResizer: vi.fn(),
  },
  dialogs: {
    openCurrentApp: vi.fn().mockResolvedValue(undefined),
  },
};

export { mockSdk };
