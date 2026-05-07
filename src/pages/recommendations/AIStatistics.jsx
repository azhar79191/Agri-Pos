import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, Database, RefreshCw, Loader2, AlertCircle, CheckCircle, XCircle, Activity } from "lucide-react";
import { getAIStats } from "../../api/cropAdvisoryApi";

const AIStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await getAIStats(params);
      console.log('AI Stats Response:', response);

      if (response.success === false) {
        throw new Error(response.message || 'Failed to fetch AI statistics');
      }

      const data = response.data || response;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch AI stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load AI statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    fetchStats();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Usage Statistics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor AI service performance and costs</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Admin Notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">Admin Only</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              This page displays AI service usage statistics and costs. Only administrators can access this information.
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={applyDateFilter}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !stats && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-12 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading AI statistics...</p>
        </div>
      )}

      {/* Statistics Display */}
      {!loading && stats && (
        <div className="space-y-5">
          {/* Request Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Requests</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.requests?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Successful</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.requests?.successful || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Failed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.requests?.failed || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Success Rate</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.requests?.successRate || '0.00'}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Statistics */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Total AI Service Cost</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">
                  {stats.cost?.currency || 'PKR'} {(stats.cost?.total || 0).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              This includes all AI API calls for crop advisory, pest detection, weather advisory, and dosage calculations.
            </p>
          </div>

          {/* Cache Statistics */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Cache Performance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cache Hits</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.cache?.hits || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cache Misses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.cache?.misses || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cached Keys</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.cache?.keys || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Hit Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.cache?.hitRate || '0.00'}%</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Note:</strong> Cache helps reduce AI API costs by storing frequently requested advisories. A higher hit rate means better cost optimization.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStatistics;
