import { create } from "zustand";
import {
  getProducts, createProduct, updateProduct,
  deleteProduct, getLowStockProducts,
} from "../api/productApi";

export const useProductStore = create((set, get) => ({
  products: [],
  brands: [],
  loading: false,
  error: null,

  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await getProducts({ isActive: true, ...params });
      const data = res.data.data;
      const products = Array.isArray(data) ? data : data?.products ?? data?.docs ?? [];
      const brands = Array.isArray(data?.brands) ? data.brands : get().brands;
      set({ products, brands, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch products", loading: false });
    }
  },

  fetchLowStock: async () => {
    const res = await getLowStockProducts();
    return res.data.data;
  },

  addProduct: async (data) => {
    const res = await createProduct(data);
    const product = res.data.data?.product ?? res.data.data;
    set((s) => ({ products: [product, ...s.products] }));
    return product;
  },

  editProduct: async (id, data) => {
    const res = await updateProduct(id, data);
    const product = res.data.data?.product ?? res.data.data;
    set((s) => ({ products: s.products.map((p) => (p._id === id ? product : p)) }));
    return product;
  },

  removeProduct: async (id) => {
    await deleteProduct(id);
    set((s) => ({ products: s.products.filter((p) => p._id !== id) }));
  },

  // Optimistic stock update — called after a sale so POS reflects new stock instantly
  decrementStock: (productId, qty) => {
    set((s) => ({
      products: s.products.map((p) =>
        p._id === productId ? { ...p, stock: Math.max(0, (p.stock ?? 0) - qty) } : p
      ),
    }));
  },
}));
