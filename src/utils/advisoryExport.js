// Export exactly the records currently displayed, from the same history source.
export async function exportAdvisoryPage(rows, format) {
  const columns = ['Date', 'Crop', 'Issue', 'Severity', 'Diagnosis'];
  const values = rows.map(row => [row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : '', row.crop || '', row.issue || '', row.severity || '', row.diagnosis || '']);
  if (format === 'excel') {
    const module = await import('exceljs');
    const workbook = new (module.default || module).Workbook();
    const sheet = workbook.addWorksheet('Advisories - current page');
    sheet.addRow(['Draft advice — expert review required. Current page only.']);
    sheet.addRow(columns);
    values.forEach(row => sheet.addRow(row));
    sheet.columns.forEach(column => { column.width = 28; });
    return new Blob([await workbook.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  if (format !== 'pdf') throw new Error('Unsupported export format');
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const document = new jsPDF();
  document.setFontSize(11);
  document.text('Advisory history - current page', 14, 16);
  document.setFontSize(9);
  document.text('Draft advice: expert review required before use.', 14, 23);
  autoTable(document, { head: [columns], body: values, startY: 29 });
  return document.output('blob');
}
