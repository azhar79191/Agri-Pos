import React, { useState } from "react";
import { Beaker, Calculator, Search, Filter, DollarSign, Droplet, Clock, AlertCircle, Package, TrendingUp, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { CROPS, PRODUCT_DATABASE, FERTILIZER_DATABASE } from "../../data/cropAdvisory";
import { calculateDosage } from "../../api/cropAdvisoryApi";

const AdvancedDosageCalculator = () => {
  const [fieldSize, setFieldSize] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedPest, setSelectedPest] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["All", "Insecticide", "Fungicide", "Fertilizer"];
  const severityLevels = ["low", "medium", "high", "critical"];

  // Get AI-powered dosage calculation
  const getAIDosage = async () => {
    if (!selectedCrop || !selectedPest || !fieldSize) {
      setError("Please select crop, pest/disease, and field size");
      return;
    }

    setLoading(true);
    setError(null);
    setAiRecommendation(null);

    try {
      const response = await calculateDosage({
        crop: selectedCrop,
        pest: selectedPest,
        fieldSize: parseFloat(fieldSize),
        severity: severity,
      });

      console.log('AI Dosage Response:', response);

      if (response.success === false) {
        throw new Error(response.message || 'Failed to calculate dosage');
      }

      const data = response.data || response;
      setAiRecommendation(data);
    } catch (err) {
      console.error('Dosage calculation error:', err);
      setError(err.message || err.response?.data?.message || 'Failed to calculate dosage');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = [...PRODUCT_DATABASE, ...FERTILIZER_DATABASE].filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleProduct = (product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const calculateLocalDosage = (product) => {
    if (product.dosage?.min) {
      const avgDosage = (product.dosage.min + product.dosage.max) / 2;
      return (avgDosage * fieldSize).toFixed(1);
    }
    if (product.dosage && selectedCrop) {
      return ((product.dosage[selectedCrop] || 0) * fieldSize).toFixed(1);
    }
    return "N/A";
  };

  const calculateCost = (product) => {
    if (!product.price) return 0;
    const dosage = parseFloat(calculateLocalDosage(product));
    if (isNaN(dosage)) return 0;
    const unit = product.unit || product.dosage?.unit || "ml/acre";
    if (unit.includes("ml")) {
      return ((dosage / 1000) * product.price).toFixed(0);
    }
    if (unit.includes("g") || unit.includes("kg")) {
      return ((dosage / 1000) * product.price).toFixed(0);
    }
    return (product.price * fieldSize).toFixed(0);
  };

  const totalCost = selectedProducts.reduce((sum, p) => sum + parseFloat(calculateCost(p) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
          <Beaker className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Advanced Dosage Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Calculate precise dosages for your field size</p>
        </div>
      </div>

      {/* Calculator Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI-Powered Dosage Calculator</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">AI</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">Crop *</label>
            <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              <option value="">Select Crop</option>
              {CROPS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">Pest/Disease *</label>
            <input 
              type="text" 
              value={selectedPest} 
              onChange={e => setSelectedPest(e.target.value)}
              placeholder="e.g., White Fly, Rust"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">Field Size (acres) *</label>
            <input type="number" value={fieldSize} onChange={e => setFieldSize(e.target.value)} min="0.1" step="0.5"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              {severityLevels.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={getAIDosage}
          disabled={loading || !selectedCrop || !selectedPest || !fieldSize}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Calculate Smart Dosage
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300">Error</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={getAIDosage}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* AI Recommendation Display */}
      {aiRecommendation && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">AI-Powered Dosage Recommendation</h3>
          </div>

          {/* Recommended Products */}
          {aiRecommendation.recommendedProducts && aiRecommendation.recommendedProducts.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Recommended Products</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiRecommendation.recommendedProducts.map((product, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{product.product}</p>
                        {product.effectiveness && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {product.effectiveness} effective
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Dosage/Acre</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{product.dosagePerAcre}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Water Volume</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{product.waterVolume}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Dosage</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{product.totalDosage}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Cost</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">PKR {product.totalCost}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spray Schedule */}
          {aiRecommendation.spraySchedule && aiRecommendation.spraySchedule.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Application Schedule
              </h4>
              <div className="space-y-2">
                {aiRecommendation.spraySchedule.map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">D{schedule.day}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{schedule.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Cost Summary */}
          {aiRecommendation.recommendedProducts && aiRecommendation.recommendedProducts.length > 0 && (
            <div className="pt-4 border-t border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Total Estimated Cost:</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  PKR {aiRecommendation.recommendedProducts.reduce((sum, p) => sum + (p.totalCost || 0), 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Calculator Section */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Manual Product Selection</h3>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 shadow-premium p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
          </div>
        </div>

      {/* Manual Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            Selected Products ({selectedProducts.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {selectedProducts.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.name}</p>
                <p className="text-xs text-slate-500 mt-1">{calculateLocalDosage(p)} {p.dosage?.unit || p.unit || "units"}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">PKR {calculateCost(p)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-emerald-200 dark:border-emerald-700">
            <span className="font-bold text-slate-900 dark:text-white">Total Estimated Cost:</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">PKR {totalCost.toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* Manual Products List */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manual Product Selection ({filteredProducts.length})</p>
        {filteredProducts.map(product => {
          const isSelected = selectedProducts.find(p => p.id === product.id);
          const dosage = calculateLocalDosage(product);
          const cost = calculateCost(product);

          return (
            <div key={product.id}
              onClick={() => toggleProduct(product)}
              className={`bg-white dark:bg-slate-900 rounded-lg border p-5 cursor-pointer transition-all hover:shadow-premium-lg ${
                isSelected 
                  ? 'border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200/80 dark:border-slate-700/50'
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{product.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {product.category}
                    </span>
                    {product.type && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {product.type}
                      </span>
                    )}
                  </div>
                  {product.brands && (
                    <p className="text-xs text-slate-500">Brands: {product.brands.join(", ")}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Base Price</p>
                  <p className="font-bold text-slate-900 dark:text-white">PKR {product.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Droplet className="w-3 h-3" />Dosage
                  </p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {dosage} {product.dosage?.unit || product.unit || "units"}
                  </p>
                </div>
                {product.waterVolume && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-400 mb-1">Water</p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{product.waterVolume}</p>
                  </div>
                )}
                {product.safetyInterval && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />Safety
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{product.safetyInterval} days</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />Cost
                  </p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">PKR {cost}</p>
                </div>
              </div>

              {product.targetPests && (
                <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs text-red-700 dark:text-red-400">
                    <span className="font-semibold">Target Pests:</span> {product.targetPests.join(", ")}
                  </p>
                </div>
              )}
              {product.targetDiseases && (
                <div className="mt-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    <span className="font-semibold">Target Diseases:</span> {product.targetDiseases.join(", ")}
                  </p>
                </div>
              )}
              {product.timing && (
                <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    <span className="font-semibold">Application Timing:</span> {product.timing.join(", ")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No products found matching your criteria</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdvancedDosageCalculator;
