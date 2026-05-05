/**
 * normalizeInvoiceItems
 *
 * The backend returns items with `unitPrice` + `productName`.
 * The POS cart uses `price` + `name`.
 * Some offline/legacy records may use either shape.
 *
 * This normalizer always produces:
 *   { name, quantity, price, unit, sku, barcode, total }
 */
export const normalizeInvoiceItems = (items = []) =>
  items.map((item) => {
    const price    = item.unitPrice    ?? item.price    ?? 0;
    const quantity = item.quantity     ?? 1;
    const total    = item.total        ?? item.lineTotal ?? (price * quantity);
    return {
      name:     item.productName || item.name || "Unknown Item",
      quantity,
      price,
      total,
      unit:     item.unit     || item.product?.unit    || "",
      sku:      item.sku      || item.product?.sku     || "",
      barcode:  item.barcode  || item.product?.barcode || "",
    };
  });
