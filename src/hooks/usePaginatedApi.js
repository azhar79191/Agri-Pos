import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * usePaginatedApi — generic hook for server-side paginated + filtered data
 *
 * @param {Function} apiFn   - API function that accepts (params) and returns axios response
 * @param {object}   initial - initial filter/param values (merged with page/limit)
 * @param {number}   limit   - page size (default 15)
 *
 * Returns: { data, loading, error, page, totalPages, total, filters, setFilter, setPage, refresh }
 */
export function usePaginatedApi(apiFn, initial = {}, limit = 15) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFiltersState] = useState(initial);
  const debounceRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const fetch = useCallback(async (currentPage, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Strip empty string values so they don't pollute query params
      const params = { page: currentPage, limit };
      Object.entries(currentFilters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params[k] = v;
      });
      const res = await apiFn(params);
      if (!mountedRef.current) return;
      const d = res.data.data;
      // Support multiple response shapes
      const items = d.items ?? d.data ?? d.bundles ?? d.returns ?? d.members ??
        d.suppliers ?? d.orders ?? d.logs ?? d.reps ?? d.batches ?? d.rows ?? [];
      const pagination = d.pagination ?? {};
      setData(items);
      setTotal(pagination.total ?? items.length);
      setTotalPages(pagination.pages ?? 1);
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [apiFn, limit]);

  // Debounced fetch when filters change (reset to page 1)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPageState(1);
      fetch(1, filters);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Immediate fetch when page changes
  useEffect(() => {
    fetch(page, filters);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFilter = useCallback((key, value) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setPage = useCallback((p) => {
    setPageState(p);
  }, []);

  const refresh = useCallback(() => {
    fetch(page, filters);
  }, [fetch, page, filters]);

  return { data, loading, error, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh };
}

export default usePaginatedApi;
