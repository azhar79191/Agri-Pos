import { confirmAction } from "../../utils/feedback";
import PageHeader from "../../components/ui/PageHeader";
import SearchableSelect from "../../components/ui/Select";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import { exportAdvisoryPage } from "../../utils/advisoryExport";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { History, Search, Filter, Calendar, Eye, Trash2, Download, Share2, AlertCircle } from "lucide-react";
import { getAllAdvisories, deleteAdvisory } from "../../api/cropAdvisoryApi";
import { useApp } from "../../context/AppContext";

const AdvisoryHistory = () => {
  const { actions } = useApp();
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAdvisory, setSelectedAdvisory] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [reload, setReload] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // Match backend default
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    crop: "",
    severity: "",
    startDate: "",
    endDate: "",
  });

  const requestVersion = useRef(0);
  const fetchAdvisories = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        ...filters,
      };

      const response = await getAllAdvisories(params);
      if (version !== requestVersion.current) return;

      // Handle nested response structure
      const data = response.data?.advisories || response.advisories || [];
      if (!Array.isArray(data)) throw new Error('Advisory response was incomplete. Please retry.');
      const pagination = response.data?.pagination || response.pagination || {};

      setAdvisories(data);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
      setTotalItems(pagination.total || pagination.totalItems || data.length);
    } catch (error) {
      if (version !== requestVersion.current) return;
      setAdvisories([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(error.response?.data?.message || error.message || 'Failed to load advisory history');
      console.error('Failed to fetch advisories:', error);
      actions.showToast({ message: error.response?.data?.message || 'Failed to load advisory history', type: 'error' });
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [page, limit, filters, actions]);

  useEffect(() => {
    const versionRef = requestVersion;
    fetchAdvisories();
    return () => { versionRef.current++; };
  }, [fetchAdvisories, reload]);

  const changeFilter = (key, value) => {
    setPage(1);
    setFilters(previous => ({ ...previous, [key]: value }));
  };

  const handleDelete = async (id) => {
    if (!(await confirmAction('Are you sure you want to delete this advisory?'))) return;

    try {
      await deleteAdvisory(id);
      actions.showToast({ message: 'Advisory deleted successfully', type: 'success' });
      setReload(value => value + 1);
    } catch (error) {
      console.error('Failed to delete advisory:', error);
      actions.showToast({ message: 'Failed to delete advisory', type: 'error' });
    }
  };

  const handleExport = async (format) => {
    if (loading || exporting || !advisories.length || error) return;
    setExporting(true);
    try {
      const blob = await exportAdvisoryPage(advisories, format);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `advisories-page-${page}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      document.body.removeChild(a);

      actions.showToast({ message: `Exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (error) {
      console.error('Failed to export:', error);
      actions.showToast({ message: 'Failed to export advisories', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[severity] || colors.Medium;
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <PageHeader title={<>Advisory History</>} description={<>View and manage past AI advisories</>} icon={History} actions={<><div className="flex gap-2">
          <button
            disabled={loading || exporting || !!error || !advisories.length}
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Excel (this page)
          </button>
          <button
            disabled={loading || exporting || !!error || !advisories.length}
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF (this page)
          </button>
        </div></>} />

      {/* Filters */}
      <div className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
        <FilterBar className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input aria-label="Search advisories"
                type="text"
                placeholder="Search advisories..."
                value={filters.search}
                onChange={(e) => changeFilter('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Crop Filter */}
          <SearchableSelect aria-label="All Crops"
            value={filters.crop}
            onChange={(e) => changeFilter('crop', e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          >
            <option value="">All Crops</option>
            <option value="cotton">Cotton</option>
            <option value="wheat">Wheat</option>
            <option value="rice">Rice</option>
            <option value="maize">Maize</option>
          </SearchableSelect>

          {/* Severity Filter */}
          <SearchableSelect aria-label="All Severities"
            value={filters.severity}
            onChange={(e) => changeFilter('severity', e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </SearchableSelect>

          {/* Date Range */}
          <div className="flex gap-2">
            <input aria-label="Start date"
              type="date"
              value={filters.startDate}
              onChange={(e) => changeFilter('startDate', e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            <input aria-label="End date" type="date" value={filters.endDate} onChange={e => changeFilter('endDate', e.target.value)} className="min-w-0 flex-1 input-premium" />
          </div>
        </FilterBar>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 p-4 text-sm text-red-600">{error} <button type="button" onClick={fetchAdvisories} className="underline">Retry</button></div>}
      {selectedAdvisory && <Modal isOpen title="Advisory details" onClose={() => setSelectedAdvisory(null)}><div className="space-y-4 break-words"><p className="text-sm text-amber-700">Draft AI advice. Expert review and product-label verification are required before use.</p><h2>{selectedAdvisory.crop} — {selectedAdvisory.issue}</h2><p>Severity: {selectedAdvisory.severity}</p><p className="whitespace-pre-wrap">{selectedAdvisory.diagnosis}</p>{selectedAdvisory.symptoms && <p>Symptoms: {selectedAdvisory.symptoms}</p>}</div></Modal>}
      {/* Advisories List */}
      <div className="workspace-panel bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">

          <div className="overflow-x-auto">
            <DataTable loading={loading} loadingLabel="Loading advisories" emptyTitle="No advisories found" sortScope="Sorting applies to this page" className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Crop</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {advisories.map((advisory) => (
                  <tr key={advisory._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {new Date(advisory.createdAt).toLocaleDateString('en-PK')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white capitalize">
                      {advisory.crop}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {advisory.issue}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(advisory.severity)}`}>
                        {advisory.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {advisory.customerName || 'Walk-in'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAdvisory(advisory)}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(advisory._id)}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>

        {/* Pagination */}
        {!loading && advisories.length > 0 && (
          <div className="flex flex-wrap gap-3 items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalItems)} of {totalItems} advisories
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisoryHistory;
