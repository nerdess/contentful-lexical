import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let editorSetValue: (value: string) => void = () => {};
vi.mock('./Lexical', () => ({
  default: ({ setValue }: { setValue: (value: string) => void }) => {
    editorSetValue = setValue;
    return null;
  },
}));

import LexicalToContentful from './LexicalToContentful';

const renderComponent = (currentValue = '<p>saved</p>') => {
  const setValue = vi.fn();
  const countChanges = { current: 0 };

  render(
    <LexicalToContentful
      initialValue={currentValue}
      currentValue={currentValue}
      countChanges={countChanges}
      setValue={setValue}
      cleanups={[]}
      setCleanups={vi.fn()}
    />
  );

  return { setValue, countChanges };
};

describe('LexicalToContentful', () => {
  beforeEach(() => {
    editorSetValue = () => {};
  });

  it('ignores the first change (loading the initial value)', () => {
    const { setValue, countChanges } = renderComponent();

    editorSetValue('<p>saved</p>');

    expect(countChanges.current).toBe(1);
    expect(setValue).not.toHaveBeenCalled();
  });

  it('saves later changes that differ from the current value', () => {
    const { setValue } = renderComponent();

    editorSetValue('<p>saved</p>');
    editorSetValue('<p>edited</p>');

    expect(setValue).toHaveBeenCalledWith('<p>edited</p>');
  });

  it('does not save a value equal to the current value', () => {
    const { setValue } = renderComponent();

    editorSetValue('<p>saved</p>');
    editorSetValue('<p>saved</p>');

    expect(setValue).not.toHaveBeenCalled();
  });

  it('saves an empty editor as an empty string, even on the first change', () => {
    const { setValue } = renderComponent();

    editorSetValue('<p></p>');

    expect(setValue).toHaveBeenCalledWith('');
  });
});
