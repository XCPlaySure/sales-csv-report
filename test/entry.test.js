import { describe, it, expect } from 'vitest';

function setupDom() {
  document.body.innerHTML = `
    <input id="file-input" type="file" />
    <section id="fault" hidden></section>
    <section id="mapping" hidden></section>
    <section id="dashboard" hidden></section>
    <section id="summary-section" hidden>
      <p id="summary-text"></p>
      <button id="copy-btn"></button>
      <button id="telegram-btn"></button>
      <p id="copy-status"></p>
    </section>`;
}

describe('entry bootstrap', () => {
  it('bootstraps the app from the page on import', async () => {
    setupDom();
    await import('../src/entry.js');
    expect(document.getElementById('mapping').hidden).toBe(true);
    expect(document.getElementById('dashboard').hidden).toBe(true);
  });
});
