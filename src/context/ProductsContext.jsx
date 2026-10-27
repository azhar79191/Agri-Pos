import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getLowStockProducts,
} from "../api/productApi";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shopCategories, setShopCategories] = useState([]);
  useEffect(() => {
    const update = (event) => setShopCategories(event.detail);
    window.addEventListener("shop-categories-updated", update);
    return () => window.removeEventListener("shop-categories-updated", update);
  }, []);
  const [loading, setLoading] = useState(false);
  const requestVersion = useRef(0);
  const [error, setError] = useState(null);
  useEffect(() => {
    const reset = () => { requestVersion.current++; setLoading(false); setProducts([]); setBrands([]); setShopCategories([]); setError(null); };
    window.addEventListener("business-session-reset", reset);
    return () => window.removeEventListener("business-session-reset", reset);
  }, []);

  const fetchProducts = useCallback(async (params) => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ isActive: true, ...params });
      if (version !== requestVersion.current) return;
      const data = res.data.data;
      setProducts(Array.isArray(data) ? data : data?.products ?? data?.docs ?? []);
      if (Array.isArray(data?.brands)) setBrands(data.brands);
      if (Array.isArray(data?.categories)) setShopCategories(data.categories);
      return res.data;
    } catch (err) {
      if (version === requestVersion.current) setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    const res = await getLowStockProducts();
    return res.data.data;
  }, []);

  const addProduct = async (data) => {
    const res = await createProduct(data);
    const product = res.data.data?.product ?? res.data.data;
    setProducts((prev) => [product, ...prev]);
    return product;
  };

  const editProduct = async (id, data) => {
    const res = await updateProduct(id, data);
    const product = res.data.data?.product ?? res.data.data;
    setProducts((prev) => prev.map((p) => (p._id === id ? product : p)));
    return product;
  };

  const removeProduct = async (id) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, brands, shopCategories, loading, error, fetchProducts, fetchLowStock, addProduct, editProduct, removeProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
};
