import { create } from "zustand";
import {
  getUsers, createUser, updateUser, deleteUser,
  updateUserPermissions, resetUserPassword, getAllPermissions,
} from "../api/usersApi";

export const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await getUsers({ limit: 100, ...params });
      const data = res.data.data;
      set({
        users: Array.isArray(data) ? data : data?.users ?? data?.docs ?? [],
        loading: false,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch users", loading: false });
    }
  },

  fetchPermissions: async () => {
    const res = await getAllPermissions();
    return res.data.data;
  },

  addUser: async (data) => {
    const res = await createUser(data);
    const user = res.data.data?.user ?? res.data.data;
    set((s) => ({ users: [user, ...s.users] }));
    return user;
  },

  editUser: async (id, data) => {
    const res = await updateUser(id, data);
    const user = res.data.data?.user ?? res.data.data;
    set((s) => ({ users: s.users.map((u) => (u._id === id ? user : u)) }));
    return user;
  },

  editPermissions: async (id, permissions) => {
    const res = await updateUserPermissions(id, permissions);
    const updated = res.data.data?.user ?? { _id: id, permissions: res.data.data?.permissions ?? permissions };
    set((s) => ({
      users: s.users.map((u) =>
        u._id === id ? { ...u, permissions: updated.permissions ?? permissions } : u
      ),
    }));
    return updated;
  },

  resetPassword: async (id, data) => {
    const res = await resetUserPassword(id, data);
    return res.data;
  },

  removeUser: async (id) => {
    await deleteUser(id);
    set((s) => ({ users: s.users.filter((u) => (u._id || u.id) !== id) }));
  },
}));
