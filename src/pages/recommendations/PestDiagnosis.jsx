import React, { useState } from "react";
import { Bug, Leaf, Sprout, ChevronRight, Loader2, Sparkles, AlertTriangle, FlaskConical, Clock, RefreshCw, Send } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import { getCropAdvisory } from "../../api/cropAdvisoryApi";

const CROP_LIST = ["Cotton", "Wheat", "Rice", "Sugarcane", "Maize", "Vegetables", "Tomato", "Potato", "Onion", "Mango", "Citrus"];

const QUICK_ISSUES = {
  Cotton: ["White Fly", "Pink Bollworm", "Aphids", "Leaf Curl Virus", "Boll Weevil"],
  Wheat: ["Rust Disease", "Aphids", "Loose Smut", "Powdery Mildew", "Armyworm"],
  Rice: ["Stem Borer", "Blast Disease", "Brown Plant Hopper", "Sheath Blight", "Leaf Folder"],
  Sugarcane: ["Borers", "Pyrilla", "Whitefly", "Red Rot", "Smut"],
  Maize: ["Fall Armyworm", "Stem Borer", "Leaf Blight", "Downy Mildew"],
  Vegetables: ["Fruit Borer", "Powdery Mildew", "Damping Off", "Aphids", "Whitefly"],
  Tomato: ["Early Blight", "Late Blight", "Fruit Borer", "Leaf Miner", "Bacterial Wilt"],
  Potato: ["Late Blight", "Early Blight", "Aphids", "Colorado Beetle", "Black Scurf"],
  Onion: ["Purple Blotch", "Thrips", "Downy Mildew", "Neck Rot"],
  Mango: ["Mango Hopper", "Powdery Mildew", "Anthracnose", "Fruit Fly"],
  Citrus: ["Citrus Psylla", "Leaf Miner", "Greening Disease", "Canker", "Tristeza"],
};

const askAI = async (crop, issue, symptoms) => {
  try {
    const response = await getCropAdvisory({
      crop: crop.toLowerCase(),
      issue: issue,
      symptoms: symptoms || '',
      fieldSize: 1,
      location: '',
      language: 'en'
    });
    
    // Transform API response to match component expectations
    const data = response.data;
    
    return {
      diagnosis: data.diagnosis,
      severity: data.severity,
      products: data.products?.map(p => p.name) || [],
      dosage: data.products?.[0]?.dosagePerAcre || 'Consult product label',
      applicationMethod: data.applicationMethod || 'Follow product instructions',
      safetyInterval: data.safetyInterval || '14 days',
      alternatives: data.alternatives || [],
      preventionTips: data.preventionTips || [],
      urgency: data.urgency || 'Apply as soon as possible',
      fullProducts: data.products || [], // Keep full product details
    };
  } catch (error) {
    console.error('AI Advisory Error:', error);
    throw error; // Don't use fallback - show error to user
  }
};

const SeverityBadge = ({ severity }) => {
  const cfg = {
    Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    High: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg[severity] || cfg.Medium}`}>{severity}</span>;
};

const PestDiagnosis = () => {
  const [step, setStep] = useState(1); // 1=crop, 2=issue, 3=result
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCropSelect = (crop) => { setSelectedCrop(crop); setSelectedIssue(null); setResult(null); setStep(2); };
  const handleIssueSelect = (issue) => { setSelectedIssue(issue); setStep(3); getRecommendation(issue); };

  const [error, setError] = useState(null);

  const getRecommendation = async (issue) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await askAI(selectedCrop, issue, symptoms);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to get AI recommendation');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(1); setSelectedCrop(null); setSelectedIssue(null); setResult(null); setSymptoms(""); };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Bug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Crop Advisory & Pest Diagnosis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered recommendations for pest and disease management</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={reset} className={`font-medium transition-colors ${step >= 1 ? 'text-emerald-600 dark:text-emerald-400 hover:underline' : 'text-slate-400'}`}>Crops</button>
        {selectedCrop && <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => { setStep(2); setResult(null); }} className={`font-medium transition-colors ${step >= 2 ? 'text-emerald-600 dark:text-emerald-400 hover:underline' : 'text-slate-400'}`}>{selectedCrop}</button>
        </>}
        {selectedIssue && <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedIssue}</span>
        </>}
      </div>

      {/* Step 1: Crop Selection */}
      {step === 1 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Your Crop</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {CROP_LIST.map(crop => (
              <button key={crop} onClick={() => handleCropSelect(crop)}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4 text-center hover:shadow-premium-lg hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{crop}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(QUICK_ISSUES[crop] || []).length} issues</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Issue Selection */}
      {step === 2 && selectedCrop && (
        <div className="space-y-4">
          {/* Optional symptoms input */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Describe symptoms (optional — improves AI accuracy)
            </label>
            <div className="flex gap-2">
              <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g. yellowing leaves, white powder on surface, holes in fruit..."
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Common Issues for {selectedCrop}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(QUICK_ISSUES[selectedCrop] || []).map(issue => (
              <button key={issue} onClick={() => handleIssueSelect(issue)}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4 text-left hover:shadow-premium-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Bug className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{issue}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>

          {/* Custom issue */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Don't see your issue? Describe it:</p>
            <div className="flex gap-2">
              <input id="custom-issue" placeholder="e.g. Brown spots on leaves, wilting plants..."
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              <button onClick={() => {
                const val = document.getElementById('custom-issue').value.trim();
                if (val) handleIssueSelect(val);
              }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--pos-primary)" }}>
                <Send className="w-4 h-4" />Ask AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: AI Result */}
      {step === 3 && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-12 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900 dark:text-white">Analyzing with AI...</p>
                <p className="text-sm text-slate-500 mt-1">Getting expert recommendations for {selectedIssue} in {selectedCrop}</p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800 p-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Failed to Get Recommendation</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => getRecommendation(selectedIssue)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                    <button 
                      onClick={() => { setStep(2); setError(null); }}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Diagnosis Header */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedIssue}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Crop: {selectedCrop}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={result.severity} />
                    <button onClick={() => getRecommendation(selectedIssue)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Refresh">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">{result.diagnosis}</p>
                </div>
                {result.urgency && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-red-600 dark:text-red-400 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />{result.urgency}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recommended Products */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-500" />Recommended Products
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(result.products || []).map(p => (
                      <span key={p} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">{p}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-400 mb-1">Dosage</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{result.dosage}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Safety Interval</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{result.safetyInterval}</p>
                    </div>
                  </div>
                  {result.applicationMethod && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Application Method</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">{result.applicationMethod}</p>
                    </div>
                  )}
                </div>

                {/* Alternatives & Prevention */}
                <div className="space-y-4">
                  {(result.alternatives || []).length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Alternative Products</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.alternatives.map(a => (
                          <span key={a} className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(result.preventionTips || []).length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />Prevention Tips
                      </h3>
                      <ul className="space-y-2">
                        {result.preventionTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep(2); setResult(null); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  ← Back to Issues
                </button>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
                  <Sprout className="w-4 h-4" />New Diagnosis
                </button>
              </div>
            </div>
          ) : (
            <EmptyState icon={Bug} title="Could not get recommendation" description="Please try again" actionLabel="Retry" onAction={() => getRecommendation(selectedIssue)} />
          )}
        </div>
      )}
    </div>
  );
};

export default PestDiagnosis;
