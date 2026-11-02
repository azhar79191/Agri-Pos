import { expect, it } from 'vitest';
import { exportAdvisoryPage } from './advisoryExport';
const records = [{ createdAt: '2026-11-02', crop: 'wheat', issue: 'rust', severity: 'Low', diagnosis: 'Draft diagnosis' }];
it('produces a real workbook containing the displayed records and draft notice', async () => {
  const blob = await exportAdvisoryPage(records, 'excel');
  const module = await import('exceljs');
  const workbook = new (module.default || module).Workbook();
  await workbook.xlsx.load(await blob.arrayBuffer());
  const sheet = workbook.worksheets[0];
  expect(sheet.getCell('A1').value).toContain('expert review required');
  expect(sheet.getRow(3).values.slice(1)).toEqual(['2026-11-02', 'wheat', 'rust', 'Low', 'Draft diagnosis']);
}, 20000);
it('produces a PDF and rejects unsupported formats', async () => {
  const blob = await exportAdvisoryPage(records, 'pdf');
  expect((await blob.text()).startsWith('%PDF-')).toBe(true);
  await expect(exportAdvisoryPage(records, 'csv')).rejects.toThrow('Unsupported');
});
