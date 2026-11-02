// @vitest-environment jsdom
import React from 'react';
import { render, cleanup, act, screen, fireEvent } from '@testing-library/react';
import { vi, it, expect, beforeEach, afterEach } from 'vitest';
import BarcodeScanner from './BarcodeScanner';
const mocks = vi.hoisted(() => ({ decode: vi.fn(), stop: vi.fn(), trackStop: vi.fn() }));
vi.mock('@zxing/browser', () => ({ BrowserMultiFormatReader: class {
  decodeFromVideoElement(...args) { return mocks.decode(...args); }
} }));
vi.mock('./ui/ModernModal', () => ({ default: ({ isOpen, children }) => isOpen ? <div>{children}</div> : null }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('BarcodeDetector', undefined);
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: mocks.trackStop }] }),
  } });
  mocks.decode.mockResolvedValue({ stop: mocks.stop });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
const props = { isOpen: true, products: [{ id: 1, barcode: '123', name: 'Seed', price: 100 }], onScan: vi.fn(), onClose: vi.fn() };
it('scans without BarcodeDetector and releases camera after finding a product', async () => {
  render(<BarcodeScanner {...props} />);
  await act(async () => { await vi.advanceTimersByTimeAsync(250); });
  expect(mocks.decode).toHaveBeenCalled();
  expect(screen.queryByText('Camera scanning not available')).toBeNull();
  await act(async () => { mocks.decode.mock.calls[0][1]({ getText: () => '123' }, undefined, { stop: mocks.stop }); });
  expect(props.onScan).toHaveBeenCalledWith(props.products[0]);
  expect(mocks.trackStop).toHaveBeenCalled();
});
it('releases a camera granted after switching to manual entry', async () => {
  let grant;
  navigator.mediaDevices.getUserMedia.mockImplementation(() => new Promise(resolve => { grant = resolve; }));
  render(<BarcodeScanner {...props} />);
  await act(async () => { await vi.advanceTimersByTimeAsync(250); });
  fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
  await act(async () => { grant({ getTracks: () => [{ stop: mocks.trackStop }] }); });
  expect(mocks.trackStop).toHaveBeenCalled();
  expect(mocks.decode).not.toHaveBeenCalled();
});
it('explains secure camera requirements without requesting camera access', async () => {
  vi.stubGlobal('isSecureContext', false);
  render(<BarcodeScanner {...props} />);
  await act(async () => { await vi.advanceTimersByTimeAsync(250); });
  expect(screen.getByText(/Camera access requires HTTPS/)).toBeTruthy();
  expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
});
