import { describe, it, expect, vi } from 'vitest';
import {
  readFile,
  copySummary,
  selectNode,
  telegramUrl,
  browserAdapters,
} from '../src/ui/adapters.js';

class OkReader {
  readAsText() {
    this.result = 'hello';
    this.onload();
  }
}

class ErrReader {
  readAsText() {
    this.error = new Error('nope');
    this.onerror();
  }
}

describe('readFile', () => {
  it('resolves with the file text', async () => {
    await expect(readFile({}, OkReader)).resolves.toBe('hello');
  });

  it('rejects when the reader errors', async () => {
    await expect(readFile({}, ErrReader)).rejects.toThrow('nope');
  });
});

describe('copySummary', () => {
  it('returns true when the clipboard write succeeds', async () => {
    const clipboard = { writeText: vi.fn(async () => {}) };
    await expect(copySummary('text', clipboard)).resolves.toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledWith('text');
  });

  it('returns false when the clipboard write throws', async () => {
    const clipboard = {
      writeText: vi.fn(async () => {
        throw new Error('denied');
      }),
    };
    await expect(copySummary('text', clipboard)).resolves.toBe(false);
  });
});

describe('selectNode', () => {
  it('selects the node contents', () => {
    const node = document.createElement('p');
    node.textContent = 'hello world';
    document.body.appendChild(node);
    selectNode(node, document);
    expect(document.defaultView.getSelection().toString()).toBe('hello world');
  });
});

describe('telegramUrl', () => {
  it('encodes the summary into a share link', () => {
    expect(telegramUrl('a b&c')).toBe('https://t.me/share/url?text=a%20b%26c');
  });

  it('includes the page url when provided', () => {
    expect(telegramUrl('a b', 'https://example.test/')).toBe(
      'https://t.me/share/url?url=https%3A%2F%2Fexample.test%2F&text=a%20b',
    );
  });
});

describe('browserAdapters', () => {
  it('builds adapters from a window object', async () => {
    const win = {
      FileReader: OkReader,
      navigator: { clipboard: { writeText: async () => {} } },
      open: vi.fn(),
    };
    const adapters = browserAdapters(win);
    expect(adapters.clipboard).toBe(win.navigator.clipboard);
    adapters.open('https://example.test');
    expect(win.open).toHaveBeenCalledWith('https://example.test', '_blank', 'noopener');
    await expect(adapters.readFile({})).resolves.toBe('hello');
  });
});
