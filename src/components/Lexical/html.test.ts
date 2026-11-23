import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { describe, expect, it } from 'vitest';

import { createTestEditor, roundTripHtml, update } from '../../../test/utils/lexical';

import { $getHtml, $htmlToNodes, $setHtml } from './html';
import { $createFAQAnswerNode } from './nodes/FAQAnswerNode';
import { $createFAQAnswerNodeInner } from './nodes/FAQAnswerNodeInner';
import { $createFAQContainerNode } from './nodes/FAQContainerNode';
import { $createFAQItemNode } from './nodes/FAQItemNode';
import { $createFAQQuestionNode } from './nodes/FAQQuestionNode';
import { $createQuoteAuthorNode } from './nodes/Quote/QuoteAuthorNode';
import { $createQuoteContainerNode } from './nodes/Quote/QuoteContainerNode';
import { $createQuoteContentNode } from './nodes/Quote/QuoteContentNode';

const expectStable = (html: string) => {
  const saved = roundTripHtml(html);
  expect(roundTripHtml(saved)).toBe(saved);
  return saved;
};

describe('$htmlToNodes', () => {
  it('returns no nodes for empty input', () => {
    const editor = createTestEditor();
    update(editor, () => {
      expect($htmlToNodes(editor, '')).toEqual([]);
      expect($htmlToNodes(editor, null)).toEqual([]);
      expect($htmlToNodes(editor, undefined)).toEqual([]);
    });
  });

  it('wraps top-level text in a paragraph and drops whitespace-only text', () => {
    const editor = createTestEditor();
    update(editor, () => {
      const nodes = $htmlToNodes(editor, 'some text');
      expect(nodes).toHaveLength(1);
      expect(nodes[0].getType()).toBe('custom-paragraph');
      expect(nodes[0].getTextContent()).toBe('some text');

      expect($htmlToNodes(editor, '   ')).toEqual([]);
    });
  });

  it('drops top-level line breaks', () => {
    const editor = createTestEditor();
    update(editor, () => {
      const types = $htmlToNodes(editor, '<p>a</p><br><p>b</p>').map(n => n.getType());
      expect(types).toEqual(['custom-paragraph', 'custom-paragraph']);
    });
  });
});

describe('$setHtml', () => {
  it('replaces existing content', () => {
    const editor = createTestEditor();
    update(editor, () => $setHtml(editor, '<p>first</p>'));
    update(editor, () => $setHtml(editor, '<p>second</p>'));

    expect(editor.read(() => $getHtml(editor))).toBe('<p>second</p>');
  });
});

describe('HTML round trip (load → save)', () => {
  it('keeps an empty document empty', () => {
    expect(roundTripHtml('')).toBe('');
  });

  it('keeps plain paragraphs and escapes special characters', () => {
    expect(expectStable('<p>Tom &amp; Jerry &lt;3</p>')).toBe('<p>Tom &amp; Jerry &lt;3</p>');
  });

  it('keeps line breaks inside paragraphs', () => {
    expect(expectStable('<p>line<br>break</p>')).toBe('<p>line<br>break</p>');
  });

  it('keeps bold and italic formatting', () => {
    expect(expectStable('<p><strong>bold</strong> <em>italic</em></p>')).toBe(
      '<p><strong>bold</strong> <em>italic</em></p>'
    );
  });

  it('normalizes <b>/<i> to <strong>/<em>', () => {
    expect(roundTripHtml('<p><b>bold</b> <i>italic</i></p>')).toBe(
      '<p><strong>bold</strong> <em>italic</em></p>'
    );
  });

  it('keeps combined, underlined and struck-through formatting', () => {
    expect(expectStable('<p><strong><em>both</em></strong> <u>u</u> <s>s</s></p>')).toBe(
      '<p><strong><em>both</em></strong> <u>u</u> <s>s</s></p>'
    );
  });

  it('keeps headings', () => {
    const saved = expectStable('<h2>Title</h2><h3>Subtitle</h3>');
    expect(saved).toMatch(/^<h2[^>]*>Title<\/h2><h3>Subtitle<\/h3>$/);
  });

  it('keeps bullet and numbered lists', () => {
    const saved = expectStable('<ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>');
    const doc = new DOMParser().parseFromString(saved, 'text/html');

    expect([...doc.querySelectorAll('ul > li')].map(li => li.textContent)).toEqual(['one', 'two']);
    expect([...doc.querySelectorAll('ol > li')].map(li => li.textContent)).toEqual(['first']);
  });

  it('keeps links with their target and rel', () => {
    const html =
      '<p><a href="https://example.com" target="_self">self</a> ' +
      '<a href="https://example.org" target="_blank" rel="noopener noreferrer">blank</a></p>';

    expect(expectStable(html)).toBe(html);
  });

  it('keeps FAQ blocks with their schema.org markup', () => {
    const editor = createTestEditor();
    update(editor, () => {
      const item = $createFAQItemNode().append(
        $createFAQQuestionNode().append($createParagraphNode().append($createTextNode('Why?'))),
        $createFAQAnswerNode().append(
          $createFAQAnswerNodeInner().append(
            $createParagraphNode().append($createTextNode('Because.'))
          )
        )
      );
      $getRoot().append($createFAQContainerNode().append(item));
    });
    const html = editor.read(() => $getHtml(editor));

    expect(expectStable(html)).toBe(html);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const container = doc.querySelector('[data-lexical-faq-container]');
    expect(container?.getAttribute('itemtype')).toBe('https://schema.org/FAQPage');
    expect(container?.querySelector('[itemprop="name"]')?.textContent).toBe('Why?');
    expect(container?.querySelector('[itemprop="text"]')?.textContent).toBe('Because.');
  });

  it('keeps quotes including their style and author', () => {
    const editor = createTestEditor();
    update(editor, () => {
      $getRoot().append(
        $createQuoteContainerNode().append(
          $createQuoteContentNode('ts-quote-style-high').append($createTextNode('To be')),
          $createQuoteAuthorNode().append($createTextNode('Shakespeare'))
        )
      );
    });
    const html = editor.read(() => $getHtml(editor));

    expect(html).toBe(
      '<figure class="ts-quote ts-quote-container">' +
        '<blockquote class="ts-quote-content ts-quote-style-high">To be</blockquote>' +
        '<figcaption class="ts-quote-author">Shakespeare</figcaption>' +
        '</figure>'
    );
    expect(expectStable(html)).toBe(html);
  });
});
