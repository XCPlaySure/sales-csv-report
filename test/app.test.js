import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initApp } from '../src/app.js';

const VALID_CSV = [
  'region,outlet_id,net_sales_idr,branch,date,invoice_no,salesman',
  'R1,O1,100,B1,2026-09-01,I1,Sam',
  'R2,O2,50,B1,2026-10-01,I2,Kim',
].join('\n');

const PARTIAL_CSV = [
  'region,outlet_id,net_sales_idr',
  'R,O1,100',
  'R,O2,abc',
].join('\n');

const ALL_BAD_CSV = ['region,outlet_id,net_sales_idr', 'R,O1,abc'].join('\n');

function setupDom() {
    document.body.innerHTML = `
    <section id="upload-prompt"></section>
    <input id="file-input" type="file" />
    <section id="fault" hidden></section>
    <section id="mapping" hidden></section>
    <section id="dashboard" hidden></section>
    <section id="summary-section" hidden>
      <p id="summary-text"></p>
      <p id="summary-basis"></p>
      <button id="copy-btn"></button>
      <button id="telegram-btn"></button>
      <p id="copy-status"></p>
    </section>`;
}

function makeAdapters({ text = VALID_CSV, writeText } = {}) {
  return {
    readFile: vi.fn(async () => text),
    clipboard: { writeText: writeText ?? vi.fn(async () => {}) },
    open: vi.fn(),
  };
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function setFiles(input, files) {
  Object.defineProperty(input, 'files', { value: files, configurable: true });
}

async function chooseFile() {
  const input = document.getElementById('file-input');
  setFiles(input, [{ name: 'sales.csv' }]);
  input.dispatchEvent(new Event('change'));
  await flush();
}

beforeEach(() => {
  setupDom();
});

describe('initApp', () => {
  it('runs the full flow and wires copy and Telegram', async () => {
    const adapters = makeAdapters();
    initApp(document, adapters);

    await chooseFile();
    expect(document.getElementById('mapping').hidden).toBe(false);
    expect(document.getElementById('upload-prompt').hidden).toBe(true);
    const processBtn = document.getElementById('process-btn');
    expect(processBtn.disabled).toBe(false);

    processBtn.click();
    expect(document.getElementById('dashboard').hidden).toBe(false);
    expect(document.getElementById('summary-section').hidden).toBe(false);
    expect(document.getElementById('mapping').hidden).toBe(true);
    expect(document.getElementById('summary-text').textContent).toContain('net sales');
    expect(document.getElementById('summary-basis').textContent).toContain('Based on 2 data rows');

    document.getElementById('copy-btn').click();
    await flush();
    expect(adapters.clipboard.writeText).toHaveBeenCalled();
    expect(document.getElementById('copy-status').textContent).toContain('copied');

    document.getElementById('telegram-btn').click();
    expect(adapters.open).toHaveBeenCalledTimes(1);
    expect(adapters.open.mock.calls[0][0]).toContain('t.me/share/url?url=');
  });

  it('keeps processing disabled and blocks a forced click for an invalid mapping', async () => {
    initApp(document, makeAdapters());
    await chooseFile();

    const select = document.querySelector('select[data-field="net_sales"]');
    select.value = '';
    select.dispatchEvent(new Event('change'));

    const processBtn = document.getElementById('process-btn');
    expect(processBtn.disabled).toBe(true);
    processBtn.disabled = false;
    processBtn.click();
    expect(processBtn.disabled).toBe(true);
    expect(document.getElementById('dashboard').hidden).toBe(true);
  });

  it('reports a file fault when no rows can be parsed', async () => {
    initApp(document, makeAdapters({ text: ALL_BAD_CSV }));
    await chooseFile();
    document.getElementById('process-btn').click();

    const fault = document.getElementById('fault');
    expect(fault.hidden).toBe(false);
    expect(fault.textContent).toContain('No usable data rows');
  });

  it('reports skipped rows while still rendering results', async () => {
    initApp(document, makeAdapters({ text: PARTIAL_CSV }));
    await chooseFile();
    document.getElementById('process-btn').click();

    expect(document.getElementById('dashboard').hidden).toBe(false);
    const fault = document.getElementById('fault');
    expect(fault.hidden).toBe(false);
    expect(fault.textContent).toContain('1 row(s) were skipped');
  });

  it('reports a fault when the file cannot be read', async () => {
    const adapters = makeAdapters();
    adapters.readFile.mockRejectedValueOnce(new Error('boom'));
    initApp(document, adapters);
    await chooseFile();

    const fault = document.getElementById('fault');
    expect(fault.hidden).toBe(false);
    expect(fault.textContent).toContain('Could not read that file');
  });

  it('reports a fault for a header-only file', async () => {
    initApp(document, makeAdapters({ text: 'region,outlet_id,net_sales_idr\n' }));
    await chooseFile();

    const fault = document.getElementById('fault');
    expect(fault.hidden).toBe(false);
    expect(fault.textContent).toContain('No usable data rows');
  });

  it('ignores a change event with no selected file', async () => {
    const adapters = makeAdapters();
    initApp(document, adapters);
    const input = document.getElementById('file-input');

    setFiles(input, undefined);
    input.dispatchEvent(new Event('change'));
    await flush();
    expect(adapters.readFile).not.toHaveBeenCalled();

    setFiles(input, []);
    input.dispatchEvent(new Event('change'));
    await flush();
    expect(adapters.readFile).not.toHaveBeenCalled();
  });

  it('falls back to selecting the summary when the clipboard is denied', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('denied');
    });
    initApp(document, makeAdapters({ writeText }));
    await chooseFile();
    document.getElementById('process-btn').click();

    document.getElementById('copy-btn').click();
    await flush();
    expect(document.getElementById('copy-status').textContent).toContain('Copy was blocked');
  });
});
