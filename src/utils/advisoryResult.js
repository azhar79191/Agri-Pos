export function advisoryResult(response, issue = '') {
  if (response?.success === false) throw new Error(response.message || 'AI service unavailable');
  const value = response?.data?.detection || response?.data?.advisory || response?.detection || response?.advisory || response?.data || response;
  if (!value || typeof value.diagnosis !== 'string' || !value.diagnosis.trim() || !['Low', 'Medium', 'High', 'Critical'].includes(value.severity)) throw new Error('The AI response was incomplete. Please retry.');
  const products = Array.isArray(value.products) ? value.products.map(item => ({ name: typeof item === 'string' ? item : item?.name })).filter(item => typeof item.name === 'string') : [];
  return {
    advisoryId: response?.data?.advisoryId || response?.advisoryId || value._id || value.id,
    diagnosis: value.diagnosis, severity: value.severity, detectedIssue: value.detectedIssue || issue,
    confidence: null, products: products.map(item => item.name), fullProducts: products,
    dosage: 'Not verified. Use a reviewed product label.',
    applicationMethod: 'Consult a qualified adviser and the verified product label.',
    safetyInterval: 'Not verified. Check the applicable product label.',
    urgency: 'Not assessed. Consult a qualified adviser.',
    alternatives: [], preventionTips: value.preventionTips || [], safetyPrecautions: value.safetyPrecautions || [],
    cached: value.cached === true, responseTime: value.responseTime || 0, source: value.source || 'ai',
  };
}
