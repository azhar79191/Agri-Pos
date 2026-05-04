import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import API from "../api/axios";

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000",
      {
        auth: { token: localStorage.getItem("token") },
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        transports: ["websocket", "polling"],
      }
    );
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// Fetch notifications from REST API
export const fetchNotificationsFromAPI = () =>
  API.get("/notifications").then(res => res.data.data?.notifications || []);

export function useSocket({ onNotifications, onNewSale, onCreditDeposited, onStockAlert, onPermissionsUpdated } = {}) {
  const handlersRef = useRef({ onNotifications, onNewSale, onCreditDeposited, onStockAlert, onPermissionsUpdated });

  useEffect(() => {
    handlersRef.current = { onNotifications, onNewSale, onCreditDeposited, onStockAlert, onPermissionsUpdated };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = getSocket();

    const handleNotifications   = (data) => handlersRef.current.onNotifications?.(data);
    const handleNewSale         = (data) => handlersRef.current.onNewSale?.(data);
    const handleCreditDeposited = (data) => handlersRef.current.onCreditDeposited?.(data);
    const handleStockAlert      = (data) => handlersRef.current.onStockAlert?.(data);
    const handlePermissions     = (data) => handlersRef.current.onPermissionsUpdated?.(data);

    socket.on("notifications",      handleNotifications);
    socket.on("new_sale",           handleNewSale);
    socket.on("credit_deposited",   handleCreditDeposited);
    socket.on("stock_alert",        handleStockAlert);
    socket.on("low_stock",          handleStockAlert);
    socket.on("permissions_updated",handlePermissions);

    return () => {
      socket.off("notifications",      handleNotifications);
      socket.off("new_sale",           handleNewSale);
      socket.off("credit_deposited",   handleCreditDeposited);
      socket.off("stock_alert",        handleStockAlert);
      socket.off("low_stock",          handleStockAlert);
      socket.off("permissions_updated",handlePermissions);
    };
  }, []);
}
