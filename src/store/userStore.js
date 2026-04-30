import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getUsers, createUser, updateUser, deleteUser,
  updateUserPermissions, grantAllPermissions, revokeAllPermissions,
  resetUserPassword, getAllPermissions,
} from "../api/usersApi";

export const useUserStore = create(
  persist(
    (set, get) => ({
      users: [],
      loading: false,
      error: null,

      fetchUsers: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await getUsers({ limit: 100, ...params });
          const data = res.data.data;
          const users = Array.isArray(data) ? data : data?.users ?? data?.docs ?? [];
          set({ users, loading: false });
          return res.data;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed to fetch users", loading: false });
        }
      },

      fetchPermissions: async () => (await getAllPermissions()).data.data,

      addUser: async (data) => {
        const res = await createUser(data);
        const user = res.data.data?.user ?? res.data.data;
        set((s) => ({ users: [user, ...s.users] }));
        return user;
      },

      editUser: async (id, data) => {
        const res = await updateUser(id, data);
        const user = res.data.data?.user ?? res.data.data;
        set((s) => ({ users: s.users.map((u) => u._id === id ? { ...u, ...user } : u) }));
        return user;
      },

      // Set a specific permissions array — calls PUT /users/:id/permissions
      editPermissions: async (id, permissions) => {
        const res = await updateUserPermissions(id, permissions);
        const updated = res.data.data;
        const newPerms = updated?.permissions ?? permissions;
        set((s) => ({
          users: s.users.map((u) => u._id === id ? { ...u, permissions: newPerms } : u),
        }));
        return updated;
      },

      // Grant all permissions — calls PUT /users/:id/permissions/grant-all
      grantAll: async (id) => {
        const res = await grantAllPermissions(id);
        const newPerms = res.data.data?.permissions ?? [];
        set((s) => ({
          users: s.users.map((u) => u._id === id ? { ...u, permissions: newPerms } : u),
        }));
        return newPerms;
      },

      // Revoke all permissions — calls PUT /users/:id/permissions/revoke-all
      revokeAll: async (id) => {
        const res = await revokeAllPermissions(id);
        const newPerms = res.data.data?.permissions ?? [];
        set((s) => ({
          users: s.users.map((u) => u._id === id ? { ...u, permissions: newPerms } : u),
        }));
        return newPerms;
      },

      resetPassword: async (id, data) => (await resetUserPassword(id, data)).data,

      removeUser: async (id) => {
        await deleteUser(id);
        set((s) => ({ users: s.users.filter((u) => (u._id || u.id) !== id) }));
      },
    }),
    { name: "pos-users", partialize: (s) => ({ users: s.users }) }
  )
);
