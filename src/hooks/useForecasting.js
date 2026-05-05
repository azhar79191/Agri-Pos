import { useState, useEffect } from "react";
import { getForecasting } from "../api/reportsApi";

/**
 * useForecasting — fetches forecasting data for the Forecasting page.
 */
export function useForecasting() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForecasting()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return {
    loading,
    combined:            data?.combined            || [],
    avgGrowth:           data?.avgGrowth           || 0,
    nextMonthForecast:   data?.nextMonthForecast   || 0,
    currentMonthActual:  data?.currentMonthActual  || 0,
  };
}
