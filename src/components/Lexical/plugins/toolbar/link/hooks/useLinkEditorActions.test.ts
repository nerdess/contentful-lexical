import { $toggleLink, LinkAttributes, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { act, renderHook } from '@testing-library/react';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
} from 'lexical';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestEditor, update } from '../../../../../../../test/utils/lexical';
import { ApiService } from '../../../../../../services/api';
import { $getHtml } from '../../../../html';

const sdk: { parameters: { instance?: Record<string, unknown> } } = { parameters: {} };

vi.mock('@contentful/react-apps-toolkit', () => ({
  useSDK: () => sdk,
}));

import { useLinkEditorActions } from './useLinkEditorActions';
import { useValidationState } from './useValidationState';

const LINKED_HTML =
  '<p>Visit <a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a></p>';

const createEditorWithSelection = (): LexicalEditor => {
  const editor = createTestEditor();
  editor.registerCommand(
    TOGGLE_LINK_COMMAND,
    payload => {
      if (payload === null || typeof payload === 'string') {
        $toggleLink(payload);
      } else {
        const { url, ...attributes } = payload as LinkAttributes & { url: string };
        $toggleLink(url, attributes);
      }
      return true;
    },
    COMMAND_PRIORITY_LOW
  );

  update(editor, () => {
    const text = $createTextNode('Visit site');
    $getRoot().append($createParagraphNode().append(text));
    text.select(6, 10);
  });

  return editor;
};

const setup = ({ isUrlValidationEnabled = true } = {}) => {
  const editor = createEditorWithSelection();
  const { result } = renderHook(() => {
    const validationState = useValidationState(isUrlValidationEnabled);
    const actions = useLinkEditorActions({
      editor,
      setIsLink: vi.fn(),
      setEditMode: vi.fn(),
      isCreatingLink: { current: false },
      hadPreviousError: { current: false },
      userEditedText: { current: false },
      isUrlValidationEnabled,
      validationState,
    });
    return { actions, validationState };
  });

  const submit = async (url: string, text = 'site') => {
    await act(async () => {
      await result.current.actions.handleSubmissionWithText(url, text, true);
    });
  };
  const html = () => editor.read(() => $getHtml(editor));

  return { result, submit, html };
};

describe('useLinkEditorActions: setting a link', () => {
  let post: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sdk.parameters = {};
    vi.stubEnv('VITE_API_URL', '');
    vi.stubEnv('VITE_AUTH_TOKEN', '');
    post = vi.spyOn(ApiService.prototype, 'post');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('without an API URL (no VITE_API_URL, no app parameter)', () => {
    it('creates the link when URL validation is enabled', async () => {
      const { submit, html, result } = setup({ isUrlValidationEnabled: true });

      await submit('https://example.com');

      expect(html()).toBe(LINKED_HTML);
      expect(result.current.validationState.validationError).toBeNull();
      expect(result.current.validationState.isValidating).toBe(false);
      expect(post).not.toHaveBeenCalled();
    });

    it('creates the link when URL validation is disabled', async () => {
      const { submit, html } = setup({ isUrlValidationEnabled: false });

      await submit('https://example.com');

      expect(html()).toBe(LINKED_HTML);
      expect(post).not.toHaveBeenCalled();
    });

    it('creates mailto links', async () => {
      const { submit, html } = setup();

      await submit('mailto:test@example.com');

      expect(html()).toContain('<a href="mailto:test@example.com"');
    });

    it('still rejects URLs with an invalid format', async () => {
      const { submit, html, result } = setup({ isUrlValidationEnabled: true });

      await submit('example.com');

      expect(html()).toBe('<p>Visit site</p>');
      expect(result.current.validationState.validationError).toBe(
        'editor.linkEditor.errorInvalidUrlFormat'
      );
    });

    it('rejects an empty URL', async () => {
      const { submit, html, result } = setup();

      await submit('   ');

      expect(html()).toBe('<p>Visit site</p>');
      expect(result.current.validationState.validationError).toBe(
        'editor.linkEditor.errorEmptyUrl'
      );
    });
  });

  describe('with an API URL', () => {
    beforeEach(() => {
      sdk.parameters.instance = { apiURL: 'https://api.example.com' };
    });

    it('validates the URL with the API before creating the link', async () => {
      post.mockResolvedValue({ success: true, status: 200, data: { valid: true, statusCode: 200 } });
      const { submit, html } = setup();

      await submit('https://example.com');

      expect(post).toHaveBeenCalledWith('/api/validate-url', { url: 'https://example.com' });
      expect(html()).toBe(LINKED_HTML);
    });

    it('does not create the link when the URL returns an HTTP error', async () => {
      post.mockResolvedValue({ success: true, status: 200, data: { valid: false, statusCode: 404 } });
      const { submit, html, result } = setup();

      await submit('https://example.com/missing');

      expect(html()).toBe('<p>Visit site</p>');
      expect(result.current.validationState.errorStatusCode).toBe(404);
    });
  });
});
