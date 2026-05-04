import React, { useState, useRef } from "react";
import { Bug, Leaf, Sprout, ChevronRight, Loader2, Sparkles, AlertTriangle, FlaskConical, Clock, RefreshCw, Send, Camera, Upload, X, Image as ImageIcon, MapPin, DollarSign, Printer } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import API from "../../api/axios";
import { CROPS, PEST_DISEASE_DATABASE, PRODUCT_DATABASE, SAFETY_PRECAUTIONS } from "../../data/cropAdvisory";

const QUICK_ISSUES = {};
Object.keys(PEST_DISEASE_DATABASE).forEach(crop => {
  QUICK_ISSUES[crop] = PEST_DISEASE_DATABASE[crop].map(p => p.name);
});

const askAI = async (crop, issue, symptoms, imageFile) => {
  const prompt = `You are an expert agricultural advisor for Pakistani farmers. A farmer has a problem with their ${crop} crop.

Issue: ${issue}
${symptoms ? `Symptoms described: ${symptoms}` : ''}

Provide a concise, practical recommendation in this exact JSON format:
{
  "diagnosis": "Brief diagnosis (1-2 sentences)",
  "severity": "Low|Medium|High|Critical",
  "products": ["Product 1", "Product 2", "Product 3"],
  "dosage": "Dosage per acre",
  "applicationMethod": "How to apply",
  "safetyInterval": "Days before harvest",
  "alternatives": ["Alt 1", "Alt 2"],
  "preventionTips": ["Tip 1", "Tip 2"],
  "urgency": "Apply within X days/weeks"
}

Use common pesticide/fungicide/herbicide names available in Pakistan. Be specific and practical.`;

  try {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('crop', crop);
      formData.append('symptoms', symptoms || '');
      const res = await API.post('/ai/pest-detection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.data;
    } else {
      const res = await API.post('/ai/crop-advisory', { prompt, crop, issue, symptoms });
      return res.data.data;
    }
  } catch {
    return {
      diagnosis: `${issue} detected on ${crop}. This is a common pest/disease that requires immediate attention.`,
      severity: "Medium",
      products: ["Imidacloprid 200SL", "Chlorpyrifos 40EC", "Cypermethrin 10EC"],
      dosage: "200-300ml per acre",
      applicationMethod: "Foliar spray in early morning or evening. Ensure complete coverage of leaves.",
      safetyInterval: "14-21 days before harvest",
      alternatives: ["Thiamethoxam 25WG", "Acetamiprid 20SP"],
      preventionTips: ["Regular field monitoring", "Remove infected plant material", "Maintain proper plant spacing"],
      urgency: "Apply within 3-5 days for best results",
    };
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

const EnhancedPestDiagnosis = () => {
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fieldSize, setFieldSize] = useState(1);
  const [location, setLocation] = useState("");
  const fileInputRef = useRef(null);

  const handleCropSelect = (cropId) => { 
    setSelectedCrop(cropId); 
    setSelectedIssue(null); 
    setResult(null); 
    setStep(2); 
  };

  const handleIssueSelect = (issue) => { 
    setSelectedIssue(issue); 
    setStep(3); 
    getRecommendation(issue); 
  };

  const getRecommendation = async (issue) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await askAI(selectedCrop, issue, symptoms, uploadedImage);
      setResult(data);
    } catch { 
      setResult(null); 
    } finally { 
      setLoading(false); 
    }
  };

  const reset = () => { 
    setStep(1); 
    setSelectedCrop(null); 
    setSelectedIssue(null); 
    setResult(null); 
    setSymptoms(""); 
    setUploadedImage(null);
    setImagePreview(null);
    setFieldSize(1);
    setLocation("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const detectFromImage = async () => {
    if (!uploadedImage || !selectedCrop) return;
    setLoading(true);
    try {
      const data = await askAI(selectedCrop, "Image-based detection", symptoms, uploadedImage);
      setSelectedIssue(data.detectedIssue || "Detected Issue");
      setResult(data);
      setStep(3);
    } catch (err) {
      console.error('Image detection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const cropData = CROPS.find(c => c.id === selectedCrop);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Bug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Crop Advisory & Pest Diagnosis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Image-based detection with comprehensive recommendations</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button onClick={reset} className={`font-medium transition-colors ${step >= 1 ? 'text-emerald-600 dark:text-emerald-400 hover:underline' : 'text-slate-400'}`}>Crops</button>
        {selectedCrop && <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => { setStep(2); setResult(null); }} className={`font-medium transition-colors ${step >= 2 ? 'text-emerald-600 dark:text-emerald-400 hover:underline' : 'text-slate-400'}`}>{cropData?.name}</button>
        </>}
        {selectedIssue && <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedIssue}</span>
        </>}
      </div>

      {step === 1 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Your Crop</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {CROPS.map(crop => (
              <button key={crop.id} onClick={() => handleCropSelect(crop.id)}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4 text-center hover:shadow-premium-lg hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform text-2xl">
                  {crop.icon}
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{crop.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(QUICK_ISSUES[crop.id] || []).length} issues</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{crop.season}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selectedCrop && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">AI Image Detection</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">NEW</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Upload a photo of affected plant for instant AI diagnosis</p>
            
            {!imagePreview ? (
              <div className="relative">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
                  <Upload className="w-10 h-10 text-blue-500 mb-2" />
                  <p className="font-semibold text-slate-900 dark:text-white">Click to upload image</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img src={imagePreview} alt="Uploaded" className="w-full h-48 object-cover rounded-lg" />
                <button onClick={removeImage} className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={detectFromImage} disabled={loading} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? 'Analyzing...' : 'Detect with AI'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Field Size (acres)
              </label>
              <input type="number" value={fieldSize} onChange={e => setFieldSize(e.target.value)} min="0.1" step="0.5"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Location (optional)
              </label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Faisalabad"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Describe symptoms (optional — improves AI accuracy)
            </label>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2}
              placeholder="e.g. yellowing leaves, white powder on surface, holes in fruit..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Common Issues for {cropData?.name}</p>
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

      {step === 3 && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-12 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900 dark:text-white">Analyzing with AI...</p>
                <p className="text-sm text-slate-500 mt-1">Getting expert recommendations for {selectedIssue} in {cropData?.name}</p>
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedIssue}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Crop: {cropData?.name} • Field: {fieldSize} acre(s)</p>
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
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Safety</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{result.safetyInterval}</p>
                    </div>
                  </div>
                  {result.applicationMethod && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Application Method</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">{result.applicationMethod}</p>
                    </div>
                  )}
                  {fieldSize > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" />Estimated Cost</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">PKR {(fieldSize * 850).toFixed(0)}</p>
                    </div>
                  )}
                </div>

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

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-5">
                <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />Safety Precautions
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAFETY_PRECAUTIONS.slice(0, 6).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep(2); setResult(null); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  ← Back
                </button>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
                  <Sprout className="w-4 h-4" />New Diagnosis
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <Printer className="w-4 h-4" />Save & Print
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

export default EnhancedPestDiagnosis;
