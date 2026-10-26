import { financialCommand } from "./financialCommand";
import API from "./axios";

export const getProducts = (params) => API.get("/products", { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getProductBySku = (sku) => API.get(`/products/sku/${sku}`);
export const getProductByBarcode = (barcode) => API.get(`/products/barcode/${barcode}`);
export const generateBarcode = () => API.get("/products/generate-barcode");
export const getLowStockProducts = () => API.get("/products/low-stock");
export const getExpiringProducts = (days = 30) => API.get("/products/expiring", { params: { days } });
export const getProductsByCategory = (category) => API.get(`/products/category/${category}`);
export const createProduct = (data) => financialCommand("post", "/products", data, { idField: "clientOperationId", label: "product creation" });
export const updateProduct = (id, data) => financialCommand("put", `/products/${id}`, data, { idField: "clientOperationId", label: "product update" });
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const hardDeleteProduct = (id) => API.delete(`/products/${id}/hard`);
