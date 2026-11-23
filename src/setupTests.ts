import '@testing-library/jest-dom';
import { configure, Config } from '@testing-library/react';

interface ExtendedConfig extends Omit<Config, 'testIdAttribute'> {
  testIdAttribute: string;
}

configure({
  testIdAttribute: 'data-test-id',
} as ExtendedConfig);
