import { expect, it } from 'vitest';
import { advisoryResult } from './advisoryResult';
it.each(['advisory', 'detection'])('uses the saved advisory ID for %s feedback and never invents timing or cost', key => {
  const result = advisoryResult({ success: true, data: { advisoryId: 'saved-id', [key]: { diagnosis: 'Draft', severity: 'Low', products: [{ name: 'Candidate', cost: 850, dosagePerAcre: 'invented' }], safetyInterval: '14-21', urgency: 'Apply now', confidence: .99 } } });
  expect(result.advisoryId).toBe('saved-id');
  expect(result.confidence).toBeNull();
  expect(result.safetyInterval).toContain('Not verified');
  expect(result.urgency).toContain('Not assessed');
  expect(result.fullProducts).toEqual([{ name: 'Candidate' }]);
  expect(result.dosage).not.toContain('invented');
});
it('rejects incomplete responses rather than fabricating a diagnosis or severity', () => {
  expect(() => advisoryResult({ data: { diagnosis: 'Draft' } })).toThrow('incomplete');
  expect(() => advisoryResult({ success: false, message: 'Provider missing' })).toThrow('Provider missing');
});
