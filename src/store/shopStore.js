import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMyShop, getShops, createShop, updateShop, deleteShop, getShopUsers, addUserToShop, addBrand, deleteBrand } from "../api/shopApi";

export const useShopStore = create(
  persist(
    (set) => ({
      shop: null,
      shops: [],
      loading: false,
      error: null,

      fetchMyShop: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getMyShop();
          const shop = res.data.data?.shop ?? res.data.data;
          set({ shop, loading: false });
          return shop;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed", loading: false });
        }
      },

      fetchShops: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getShops();
          const data = res.data.data;
          set({ shops: Array.isArray(data) ? data : data?.shops ?? [], loading: false });
          return data;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed", loading: false });
        }
      },

      createShop: async (data) => {
        const res = await createShop(data);
        const shop = res.data.data?.shop ?? res.data.data;
        set((s) => ({ shops: [shop, ...s.shops], shop }));
        return shop;
      },

      updateShop: async (id, data) => {
        const res = await updateShop(id, data);
        const shop = res.data.data?.shop ?? res.data.data;
        set((s) => ({ shop: s.shop?._id === id ? shop : s.shop, shops: s.shops.map((sh) => (sh._id === id ? shop : sh)) }));
        return shop;
      },

      deleteShop: async (id) => {
        await deleteShop(id);
        set((s) => ({ shops: s.shops.filter((sh) => sh._id !== id) }));
      },

      fetchShopUsers: async (id) => (await getShopUsers(id)).data.data,
      addUser: async (id, data) => (await addUserToShop(id, data)).data.data,

      addBrand: async (id, brand) => {
        const res = await addBrand(id, brand);
        const shop = res.data.data?.shop ?? res.data.data;
        set((s) => ({ shop: s.shop?._id === id ? shop : s.shop }));
        return shop;
      },

      deleteBrand: async (id, brand) => {
        const res = await deleteBrand(id, brand);
        const shop = res.data.data?.shop ?? res.data.data;
        set((s) => ({ shop: s.shop?._id === id ? shop : s.shop }));
        return shop;
      },
    }),
    { name: "pos-shop", partialize: (s) => ({ shop: s.shop, shops: s.shops }) }
  )
);
