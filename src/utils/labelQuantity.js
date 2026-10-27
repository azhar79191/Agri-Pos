export function labelQuantity({ area, areaUnit, rate, rateAreaUnit, quantityUnit }) {
  const size = Number(area), amount = Number(rate);
  const hectares = { acre: 0.40468564224, hectare: 1 };
  if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(amount) || amount <= 0) throw new Error('Enter a positive field area and label rate.');
  if (!hectares[areaUnit] || !hectares[rateAreaUnit] || !['g', 'kg', 'ml', 'L'].includes(quantityUnit)) throw new Error('Choose explicit supported units.');
  const total = size * hectares[areaUnit] / hectares[rateAreaUnit] * amount;
  if (!Number.isFinite(total)) throw new Error('The quantity is too large. Check the inputs.');
  return { total, quantityUnit };
}
