import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSettings, updateSettings, resetSettings, getShopInfo } from "../api/settingsApi";

export const useSettingsStore = create(
  persist(
    (set) => ({
      settings: null,
      loading: false,
      error: null,

      fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getSettings();
          const data = res.data.data ?? res.data;
          set({ settings: data, loading: false });
          return data;
        } catch (err) {
          set({ error: err.response?.data?.message || "Failed to fetch settings", loading: false });
        }
      },

      fetchShopInfo: async () => (await getShopInfo()).data.data,

      saveSettings: async (data) => {
        const res = await updateSettings(data);
        const updated = res.data.data ?? res.data;
        set({ settings: updated });
        return updated;
      },

      reset: async () => {
        const res = await resetSettings();
        const data = res.data.data ?? res.data;
        set({ settings: data });
        return data;
      },
    }),
    { name: "pos-settings", partialize: (s) => ({ settings: s.settings }) }
  )
);
