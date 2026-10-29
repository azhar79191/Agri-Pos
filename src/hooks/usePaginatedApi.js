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
  const requestRef = useRef(0);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const fetch = useCallback(async (currentPage, currentFilters) => {
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      // Strip empty string values so they don't pollute query params
      const params = { page: currentPage, limit };
      Object.entries(currentFilters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params[k] = v;
      });
      const res = await apiFn(params);
      if (!mountedRef.current || request !== requestRef.current) return;
      const d = res.data.data;
      // Support multiple response shapes
      const items = d.items ?? d.data ?? d.bundles ?? d.returns ?? d.members ??
        d.suppliers ?? d.orders ?? d.logs ?? d.reps ?? d.batches ?? d.rows ?? [];
      const pagination = d.pagination ?? res.data.pagination ?? {};
      setData(items);
      setTotal(pagination.total ?? items.length);
      setTotalPages(pagination.pages ?? 1);
    } catch (err) {
      if (mountedRef.current && request === requestRef.current) setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      if (mountedRef.current && request === requestRef.current) setLoading(false);
    }
  }, [apiFn, limit]);

  // A single request path prevents a slow previous filter from replacing new data.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(page, filters);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [filters, page, fetch]);

  const setFilter = useCallback((key, value) => {
    ++requestRef.current;
    setPageState(1);
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters) => {
    ++requestRef.current;
    setPageState(1);
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setPage = useCallback((p) => {
    ++requestRef.current;
    setLoading(true);
    setPageState(p);
  }, []);

  const refresh = useCallback(() => {
    fetch(page, filters);
  }, [fetch, page, filters]);

  return { data, loading, error, page, totalPages, total, filters, setFilter, setFilters, setPage, refresh };
}

export default usePaginatedApi;
