import { parseCsv, detectMapping, validateMapping, parseRows } from './lib/parse.js';
import { analyze } from './lib/analyze.js';
import { buildSummary } from './lib/summary.js';
import { mappingPanelHtml, dashboardHtml, faultHtml } from './ui/views.js';
import { copySummary, selectNode, telegramUrl } from './ui/adapters.js';
import { summaryBasis } from './lib/summary.js';

export function initApp(doc, adapters) {
  const fileInput = doc.getElementById('file-input');
  const uploadPrompt = doc.getElementById('upload-prompt');
  const mappingEl = doc.getElementById('mapping');
  const dashboardEl = doc.getElementById('dashboard');
  const summarySection = doc.getElementById('summary-section');
  const summaryText = doc.getElementById('summary-text');
  const summaryBasisEl = doc.getElementById('summary-basis');
  const copyStatus = doc.getElementById('copy-status');
  const faultEl = doc.getElementById('fault');
  const copyBtn = doc.getElementById('copy-btn');
  const telegramBtn = doc.getElementById('telegram-btn');

  const state = { headers: [], rows: [], sample: [], mapping: null, summary: '' };

  function showFault(message) {
    faultEl.innerHTML = faultHtml(message);
    faultEl.hidden = false;
    mappingEl.hidden = true;
    dashboardEl.hidden = true;
    summarySection.hidden = true;
    uploadPrompt.hidden = true;
  }

  function renderMapping(mapping) {
    const validation = validateMapping(mapping);
    mappingEl.innerHTML = mappingPanelHtml(state.headers, state.sample, mapping, validation);
    mappingEl.hidden = false;
    uploadPrompt.hidden = true;
    faultEl.hidden = true;
    dashboardEl.hidden = true;
    summarySection.hidden = true;
    mappingEl
      .querySelectorAll('select[data-field]')
      .forEach((select) => select.addEventListener('change', updateValidation));
    mappingEl.querySelector('#process-btn').addEventListener('click', onProcess);
    updateValidation();
  }

  function loadText(text) {
    const { headers, rows } = parseCsv(text);
    if (headers.length === 0 || rows.length === 0) {
      showFault(
        'No usable data rows were found. Add a header row and at least one data row, then re-upload the file.',
      );
      return;
    }
    state.headers = headers;
    state.rows = rows;
    state.sample = rows[0];
    state.mapping = detectMapping(headers);
    renderMapping(state.mapping);
  }

  function readMapping() {
    const mapping = {};
    mappingEl.querySelectorAll('select[data-field]').forEach((select) => {
      mapping[select.dataset.field] = select.value === '' ? null : Number(select.value);
    });
    return mapping;
  }

  function updateValidation() {
    const mapping = readMapping();
    const validation = validateMapping(mapping);
    mappingEl.querySelector('#process-btn').disabled = !validation.ok;
    mappingEl.querySelector('.mapping-errors').textContent = validation.errors.join(' ');
  }

  function onProcess() {
    const mapping = readMapping();
    const validation = validateMapping(mapping);
    if (!validation.ok) {
      updateValidation();
      return;
    }

    const { records, skipped } = parseRows(state.rows, mapping);
    if (records.length === 0) {
      showFault('No usable data rows were found. Check the mapped columns and re-upload the file.');
      return;
    }

    const agg = analyze(records, mapping);
    const summary = buildSummary(agg);
    const basis = summaryBasis(agg, skipped.length);
    dashboardEl.innerHTML = dashboardHtml(agg);
    dashboardEl.hidden = false;
    summaryText.textContent = summary;
    summarySection.hidden = false;
    summaryBasisEl.textContent = basis;
    summaryBasisEl.hidden = !basis;
    mappingEl.hidden = true;
    uploadPrompt.hidden = true;
    state.mapping = mapping;
    state.summary = summary;

    if (skipped.length > 0) {
      faultEl.innerHTML = faultHtml(
        `${skipped.length} row(s) were skipped because a mapped numeric value was not a number. Fix the file and re-upload for complete results.`,
      );
      faultEl.hidden = false;
    } else {
      faultEl.innerHTML = '';
      faultEl.hidden = true;
    }
  }

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const text = await adapters.readFile(file);
      loadText(text);
    } catch {
      showFault('Could not read that file. Please check it and try again.');
    }
  });

  copyBtn.addEventListener('click', async () => {
    const copied = await copySummary(state.summary, adapters.clipboard);
    if (copied) {
      copyStatus.textContent = 'Summary copied to clipboard.';
      return;
    }
    selectNode(summaryText, doc);
    copyStatus.textContent = 'Copy was blocked. The summary is selected; press Ctrl+C or Cmd+C.';
  });

  telegramBtn.addEventListener('click', () => {
    adapters.open(telegramUrl(state.summary, doc.location.href));
  });
}
