import API from "./axios";

export const getStockLogs = (params) => API.get("/stock/logs", { params });
export const getStockAlerts = () => API.get("/stock/alerts");
export const getStockLevels = () => API.get("/stock/levels");
export const getStockSummary = () => API.get("/stock/summary");
export const adjustStock = (data) => API.post("/stock/adjust", data);
export const bulkAdjustStock = (data) => API.post("/stock/adjust/bulk", data);
