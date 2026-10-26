import { financialCommand } from "./financialCommand";
import API from "./axios";

export const getStockLogs = (params) => API.get("/stock/logs", { params });
export const getStockAlerts = () => API.get("/stock/alerts");
export const getStockLevels = () => API.get("/stock/levels");
export const getStockSummary = () => API.get("/stock/summary");
export const adjustStock = (data) => financialCommand("post", "/stock/adjust", data, { idField: "clientOperationId", label: "stock adjustment" });
export const bulkAdjustStock = (data) => financialCommand("post", "/stock/adjust/bulk", data, { idField: "clientOperationId", label: "bulk stock adjustment" });
