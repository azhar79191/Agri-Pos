import { browserScope } from './browserScope';

/** Read all directory pages, refusing partial or mixed-company exports. */
export async function collectDirectory(fetchPage, key) {
  const scope = browserScope();
  const records = [], ids = new Set();
  let pages = 1, total;
  for (let page = 1; page <= pages; page++) {
    if (browserScope() !== scope) throw new Error('Your session changed. Start the export again.');
    const response = await fetchPage({ page, limit: 100 });
    if (browserScope() !== scope) throw new Error('Your session changed. Start the export again.');
    const data = response.data?.data;
    const items = data?.[key];
    const pagination = data?.pagination;
    if (!Array.isArray(items) || !pagination || !Number.isSafeInteger(pagination.total) || pagination.total < 0 || !Number.isSafeInteger(pagination.pages) || pagination.pages < 0) throw new Error('The directory response is incomplete. No file was exported.');
    if (page === 1) { total = pagination.total; pages = Math.max(1, pagination.pages); }
    if (total > 100000 || pages > 1000) throw new Error('This directory is too large for a browser export. Request an administrator export.');
    if (pagination.total !== total) throw new Error('The directory changed during export. Please retry.');
    for (const item of items) {
      if (!item._id || ids.has(item._id)) throw new Error('The directory changed during export. Please retry.');
      ids.add(item._id);
      records.push(item);
    }
  }
  if (records.length !== total) throw new Error('The export was incomplete. Please retry; no file was saved.');
  return records;
}
