import API from "./axios";

export const getSettings = () => API.get("/settings");
export const getShopInfo = () => API.get("/settings/shop");
export const updateSettings = (data) => API.put("/settings", data);
export const resetSettings = () => API.post("/settings/reset");
