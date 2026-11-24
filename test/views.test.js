import { describe, it, expect } from 'vitest';
import { analyze } from '../src/lib/analyze.js';
import { dashboardHtml, mappingPanelHtml, faultHtml } from '../src/ui/views.js';
import { validateMapping } from '../src/lib/parse.js';
import * as fixtures from './fixtures.js';

function dashboardFor(fixture) {
  return dashboardHtml(analyze(fixture.records, fixture.mapping));
}

describe('dashboardHtml', () => {
  it('renders the full report for rich data', () => {
    const html = dashboardFor(fixtures.rich);
    expect(html).toContain('Invoices: <strong>3</strong>');
    expect(html).toContain('Net sales by branch');
    expect(html).toContain('B1');
    expect(html).toContain('Delta');
    expect(html).toContain('CRITICAL');
    expect(html).toContain('72,7%');
    expect(html).not.toContain('None of these outlets');
    expect(html).not.toContain('Single month');
    expect(html).not.toContain('Only one region');
    expect(html).not.toContain('perform similarly');
  });

  it('renders limited data notes for plain data', () => {
    const html = dashboardFor(fixtures.plain);
    expect(html).not.toContain('Invoices:');
    expect(html).not.toContain('Net sales by branch');
    expect(html).toContain('Outlets perform similarly');
    expect(html).toContain('Single month of data');
    expect(html).toContain('Only one region');
    expect(html).toContain('None of these outlets is critically underperforming');
  });

  it('renders negative totals with unavailable share and n/a ratios', () => {
    const html = dashboardFor(fixtures.negativeMulti);
    expect(html).toContain('Net sales are negative');
    expect(html).toContain('Share is unavailable');
    expect(html).toContain('n/a');
    expect(html).toContain('Net sales by branch');
    expect(html).toContain('None of these outlets');
  });

  it('renders a zero total', () => {
    const html = dashboardFor(fixtures.zero);
    expect(html).toContain('Net sales are zero');
    expect(html).toContain('Share is unavailable');
  });

  it('renders the empty state', () => {
    const html = dashboardHtml(analyze([], {}));
    expect(html).toContain('No outlets to rank');
    expect(html).not.toContain('perform similarly');
    expect(html).toContain('Single month of data');
    expect(html).toContain('Only one region');
  });

  it('renders a tier legend after the table when outlets are ranked', () => {
    const html = dashboardFor(fixtures.rich);
    expect(html).toContain('Tiers (% of region average):');
    expect(html).toContain('CRITICAL</span> below 25,0%');
    expect(html).toContain('LOW</span> 25,0% to below 50,0%');
    expect(html).toContain('BELOW</span> 50,0% to below 100,0%');
    expect(html).toContain('OK</span> 100,0% or more');
    expect(html.indexOf('Tiers (% of region average):')).toBeGreaterThan(
      html.lastIndexOf('</tbody></table>'),
    );
  });

  it('omits the tier legend when there are no outlets', () => {
    const html = dashboardHtml(analyze([], {}));
    expect(html).not.toContain('Tiers (% of region average):');
  });

  it('numbers rows in the region, branch, and weakest tables', () => {
    const html = dashboardFor(fixtures.rich);
    expect(html).toContain('<th>#</th><th>Region</th>');
    expect(html).toContain('<th>#</th><th>Branch</th>');
    expect(html).toContain('<th>#</th><th>Outlet</th>');
    expect(html).toContain('<td>1</td><td>R1</td>');
    expect(html).toContain('<td>1</td><td>B1</td>');
    expect(html).toContain('<td>1</td><td>Delta</td>');
  });
});

describe('mappingPanelHtml', () => {
  const headers = ['region', 'outlet_id', '<b>net</b>'];
  const sampleRow = ['R', 'O1', '100'];

  it('renders selects with selected options and samples', () => {
    const mapping = { region: 0, outlet_id: 1, net_sales: 2 };
    const html = mappingPanelHtml(headers, sampleRow, mapping, validateMapping(mapping));
    expect(html).toContain('<option value="0" selected>region</option>');
    expect(html).toContain('<td class="sample">R</td>');
    expect(html).toContain('<td class="sample">100</td>');
    expect(html).toContain('&lt;b&gt;net&lt;/b&gt;');
    expect(html).not.toContain('disabled');
    expect(html).not.toContain('derived');
  });

  it('disables processing and explains derived net sales', () => {
    const mapping = { region: null, outlet_id: 1, net_sales: null, gross_sales: 2, discount: 3 };
    const html = mappingPanelHtml(headers, sampleRow, mapping, validateMapping(mapping));
    expect(html).toContain('disabled');
    expect(html).toContain('Net sales will be derived as gross minus discount.');
    expect(html).toContain('Map these required fields: region.');
  });
});

describe('faultHtml', () => {
  it('frames the problem as the file and escapes the message', () => {
    const html = faultHtml('<bad> file');
    expect(html).toContain('Problem with this CSV file.');
    expect(html).toContain('&lt;bad&gt; file');
  });
});
