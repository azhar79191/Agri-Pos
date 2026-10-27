import { expect, it } from 'vitest';
import { labelQuantity } from './labelQuantity';
it('scales a supplied label rate with matching area units', () => {
  expect(labelQuantity({ area: 2.5, areaUnit: 'acre', rate: 100, rateAreaUnit: 'acre', quantityUnit: 'ml' })).toEqual({ total: 250, quantityUnit: 'ml' });
});
it('converts acreage to hectares without changing quantity units', () => {
  expect(labelQuantity({ area: 1, areaUnit: 'acre', rate: 100, rateAreaUnit: 'hectare', quantityUnit: 'g' }).total).toBeCloseTo(40.468564224, 8);
});
it('rejects ambiguous units and invalid quantities', () => {
  const valid = { area: 1, areaUnit: 'acre', rate: 100, rateAreaUnit: 'acre', quantityUnit: 'ml' };
  for (const override of [{ area: 0 }, { rate: -1 }, { area: Infinity }, { quantityUnit: 'bottle' }, { rateAreaUnit: 'tank' }]) expect(() => labelQuantity({ ...valid, ...override })).toThrow();
});
