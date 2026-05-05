import { useState, useEffect, useCallback } from "react";
import { getForecasting } from "../api/reportsApi";

export function useForecasting(dateRange) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = dateRange?.start && dateRange?.end ? { startDate: dateRange.start, endDate: dateRange.end } : {};
    getForecasting(params)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateRange?.start, dateRange?.end]); // eslint-disable-line

  useEffect(() => { fetch(); }, [fetch]);

  return {
    loading,
    combined:            data?.combined            || [],
    avgGrowth:           data?.avgGrowth           || 0,
    nextMonthForecast:   data?.nextMonthForecast   || 0,
    currentMonthActual:  data?.currentMonthActual  || 0,
  };
}
