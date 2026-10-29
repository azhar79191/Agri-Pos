// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import UsersPanel from './UsersPanel';
const mocks = vi.hoisted(() => ({ addUser: vi.fn().mockResolvedValue({}), fetchUsers: vi.fn(), showToast: vi.fn(), get: vi.fn().mockResolvedValue({ data: { data: { roles: [{ _id: 'visitor-role', name: 'Visitor' }] } } }) }));
vi.mock('../../../api/axios', () => ({ default: { get: mocks.get } }));
vi.mock('../../../context/AppContext', () => ({ useApp: () => ({ state: { currentUser: { role: 'admin' } }, actions: { showToast: mocks.showToast } }) }));
vi.mock('../../../hooks/useUsers', () => ({ useUsers: () => ({ users: [], loading: false, fetchUsers: mocks.fetchUsers, addUser: mocks.addUser }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('creates staff with a custom role through the searchable role selector', async () => {
  render(<UsersPanel />);
  fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
  fireEvent.click(screen.getByRole('combobox', { name: 'Role' }));
  await screen.findByRole('option', { name: 'Visitor' });
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search options' }), { target: { value: 'vis' } });
  expect(screen.queryByRole('option', { name: 'Cashier' })).toBeNull();
  fireEvent.click(screen.getByRole('option', { name: 'Visitor' }));
  fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'New Staff' } });
  fireEvent.change(screen.getByPlaceholderText('john@shop.com'), { target: { value: 'staff@example.test' } });
  fireEvent.change(screen.getByPlaceholderText('Min 8 characters'), { target: { value: 'test-password' } });
  fireEvent.click(screen.getAllByRole('button', { name: 'Add User' }).at(-1));
  await waitFor(() => expect(mocks.addUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'cashier', customRoleId: 'visitor-role', email: 'staff@example.test' })));
});
