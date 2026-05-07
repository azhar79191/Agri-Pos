import React, { useState, useRef } from "react";
import { Bug, Leaf, Sprout, ChevronRight, Loader2, Sparkles, AlertTriangle, FlaskConical, Clock, RefreshCw, Send, Camera, Upload, X, Image as ImageIcon, MapPin, DollarSign, Printer } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import { getCropAdvisory, detectPestFromImage } from "../../api/cropAdvisoryApi";
import { CROPS, PEST_DISEASE_DATABASE, PRODUCT_DATABASE, SAFETY_PRECAUTIONS } from "../../data/cropAdvisory";

const QUICK_ISSUES = {};
Object.keys(PEST_DISEASE_DATABASE).forEach(crop => {
  QUICK_ISSUES[crop] = PEST_DISEASE_DATABASE[crop].map(p => p.name);
});

const askAI = async (crop, issue, symptoms, imageFile, fieldSize, location) => {
  try {
    if (imageFile) {
      // Image-based detection
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('crop', crop);
      formData.append('symptoms', symptoms || '');
      if (location) formData.append('location', location);
      
      const response = await detectPestFromImage(formData);
      
      // Safe logging - stringify to avoid circular reference errors
      try {
        console.log('Image Detection Full Response:', JSON.stringify(response, null, 2));
      } catch (logError) {
        console.log('Image Detection Response (could not stringify):', response);
      }
      
      // Check if API returned an error
      if (response.success === false) {
        throw new Error(response.message || 'AI service unavailable');
      }
      
      // Extract detection data - handle nested structure (data.detection for images)
      const advisory = response.data?.detection || response.detection || response.data?.advisory || response.advisory || response.data || response;
      
      console.log('Image Detection Advisory:', advisory);
      
      // Transform response
      return {
        diagnosis: advisory.diagnosis || 'No diagnosis available',
        severity: advisory.severity || 'Medium',
        detectedIssue: advisory.detectedIssue || 'Detected Issue',
        confidence: advisory.confidence || 0,
        products: advisory.products?.map(p => typeof p === 'string' ? p : p.name) || [],
        dosage: advisory.products?.[0]?.dosagePerAcre || advisory.products?.[0]?.dosage || 'Consult product label',
        applicationMethod: advisory.applicationMethod || 'Follow product instructions',
        safetyInterval: advisory.safetyInterval || '14-21 days',
        alternatives: advisory.alternatives || [],
        preventionTips: advisory.preventionTips || [],
        urgency: advisory.urgency || 'Apply as soon as possible',
        bestTimeToApply: advisory.bestTimeToApply || '',
        safetyPrecautions: advisory.safetyPrecautions || [],
        imageAnalysis: advisory.imageAnalysis || '',
        fullProducts: advisory.products || [],
        cached: advisory.cached || false,
        responseTime: advisory.responseTime || 0,
        source: advisory.source || 'ai',
      };
    } else {
      // Text-based advisory
      const response = await getCropAdvisory({
        crop: crop.toLowerCase(),
        issue: issue,
        symptoms: symptoms || '',
        fieldSize: fieldSize || 1,
        location: location || '',
        language: 'en'
      });
      
      // Safe logging - stringify to avoid circular reference errors
      try {
        console.log('Text Advisory Full Response:', JSON.stringify(response, null, 2));
      } catch (logError) {
        console.log('Text Advisory Response (could not stringify):', response);
      }
      
      // Check if API returned an error
      if (response.success === false) {
        throw new Error(response.message || 'AI service unavailable');
      }
      
      // Extract advisory data - handle nested structure
      const advisory = response.data?.advisory || response.advisory || response.data || response;
      
      console.log('Text Advisory Advisory:', advisory);
      
      return {
        diagnosis: advisory.diagnosis || 'No diagnosis available',
        severity: advisory.severity || 'Medium',
        detectedIssue: advisory.detectedIssue || issue,
        confidence: advisory.confidence || 0,
        products: advisory.products?.map(p => typeof p === 'string' ? p : p.name) || [],
        dosage: advisory.products?.[0]?.dosagePerAcre || advisory.products?.[0]?.dosage || 'Consult product label',
        applicationMethod: advisory.applicationMethod || 'Follow product instructions',
        safetyInterval: advisory.safetyInterval || '14-21 days',
        alternatives: advisory.alternatives || [],
        preventionTips: advisory.preventionTips || [],
        urgency: advisory.urgency || 'Apply as soon as possible',
        bestTimeToApply: advisory.bestTimeToApply || '',
        safetyPrecautions: advisory.safetyPrecautions || [],
        fullProducts: advisory.products || [],
        cached: advisory.cached || false,
        responseTime: advisory.responseTime || 0,
        source: advisory.source || 'ai',
      };
    }
  } catch (error) {
    console.error('AI Advisory Error:', error);
    console.error('Error Response:', error.response?.data);
    
    // Extract error message
    const errorMessage = error.message 
      || error.response?.data?.message 
      || error.response?.data?.error?.message
      || 'Failed to get AI recommendation';
    
    throw new Error(errorMessage);
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
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      const data = await askAI(selectedCrop, issue, symptoms, uploadedImage, fieldSize, location);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to get AI recommendation');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const detectFromImage = async () => {
    if (!uploadedImage || !selectedCrop) return;
    setLoading(true);
    setError(null);
    try {
      const data = await askAI(selectedCrop, "Image-based detection", symptoms, uploadedImage, fieldSize, location);
      setSelectedIssue(data.detectedIssue || "Detected Issue");
      setResult(data);
      setStep(3);
    } catch (err) {
      console.error('Image detection failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to detect from image');
      setSelectedIssue("Detection Failed");
      setResult(null);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { 
    setStep(1); 
    setSelectedCrop(null); 
    setSelectedIssue(null); 
    setResult(null); 
    setError(null);
    setSymptoms(""); 
    setUploadedImage(null);
    setImagePreview(null);
    setFieldSize(1);
    setLocation("");
  };

  const handlePrint = () => {
    // Create a printable version of the advisory
    const printWindow = window.open('', '_blank');
    const cropData = CROPS.find(c => c.id === selectedCrop);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AgriNest - Crop Advisory Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #3B82F6;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #3B82F6; 
              font-size: 28px;
              margin-bottom: 5px;
            }
            .header p { 
              color: #666; 
              font-size: 14px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 2px solid #e2e8f0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              background: #f8fafc;
              padding: 12px;
              border-radius: 8px;
              border-left: 3px solid #3B82F6;
            }
            .info-label {
              font-size: 12px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 16px;
              color: #1e293b;
              font-weight: 600;
            }
            .diagnosis-box {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .product-card {
              background: #f0fdf4;
              border: 1px solid #86efac;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 10px;
            }
            .product-name {
              font-size: 16px;
              font-weight: bold;
              color: #166534;
              margin-bottom: 5px;
            }
            .product-detail {
              font-size: 14px;
              color: #15803d;
              margin: 3px 0;
            }
            ul {
              list-style: none;
              padding-left: 0;
            }
            li {
              padding: 8px 0;
              padding-left: 25px;
              position: relative;
            }
            li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #10b981;
              font-weight: bold;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-right: 8px;
            }
            .badge-medium { background: #fef3c7; color: #92400e; }
            .badge-high { background: #fee2e2; color: #991b1b; }
            .badge-low { background: #d1fae5; color: #065f46; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
            .confidence-bar {
              background: #e2e8f0;
              height: 20px;
              border-radius: 10px;
              overflow: hidden;
              margin-top: 5px;
            }
            .confidence-fill {
              background: linear-gradient(to right, #10b981, #059669);
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
            }
            @media print {
              body { padding: 20px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌾 AgriNest Crop Advisory Report</h1>
            <p>AI-Powered Pest & Disease Diagnosis</p>
            <p style="margin-top: 10px;">Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Crop</div>
              <div class="info-value">${cropData?.name || selectedCrop}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Issue Detected</div>
              <div class="info-value">${selectedIssue}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Field Size</div>
              <div class="info-value">${fieldSize} acre(s)</div>
            </div>
            <div class="info-item">
              <div class="info-label">Location</div>
              <div class="info-value">${location || 'Not specified'}</div>
            </div>
          </div>

          ${result.confidence > 0 ? `
            <div class="section">
              <div class="section-title">AI Confidence</div>
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${result.confidence * 100}%">
                  ${(result.confidence * 100).toFixed(0)}% Confident
                </div>
              </div>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Diagnosis</div>
            <div class="diagnosis-box">
              <span class="badge badge-${result.severity?.toLowerCase() || 'medium'}">${result.severity || 'Medium'} Severity</span>
              <p style="margin-top: 10px;">${result.diagnosis}</p>
            </div>
            ${result.urgency ? `<p style="color: #dc2626; font-weight: bold;">⚠️ ${result.urgency}</p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Recommended Products</div>
            ${result.fullProducts && result.fullProducts.length > 0 ? 
              result.fullProducts.map(product => `
                <div class="product-card">
                  <div class="product-name">${product.name || product}</div>
                  ${product.activeIngredient ? `<div class="product-detail">Active Ingredient: ${product.activeIngredient}</div>` : ''}
                  ${product.dosagePerAcre ? `<div class="product-detail">Dosage: ${product.dosagePerAcre}</div>` : ''}
                </div>
              `).join('') 
              : 
              result.products?.map(p => `<div class="product-card"><div class="product-name">${p}</div></div>`).join('')
            }
          </div>

          ${result.applicationMethod ? `
            <div class="section">
              <div class="section-title">Application Method</div>
              <p>${result.applicationMethod}</p>
            </div>
          ` : ''}

          ${result.bestTimeToApply ? `
            <div class="section">
              <div class="section-title">Best Time to Apply</div>
              <p>🕐 ${result.bestTimeToApply}</p>
            </div>
          ` : ''}

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Safety Interval</div>
              <div class="info-value">${result.safetyInterval}</div>
            </div>
            ${fieldSize > 0 ? `
              <div class="info-item">
                <div class="info-label">Estimated Cost</div>
                <div class="info-value">PKR ${(fieldSize * 850).toFixed(0)}</div>
              </div>
            ` : ''}
          </div>

          ${result.alternatives && result.alternatives.length > 0 ? `
            <div class="section">
              <div class="section-title">Alternative Products</div>
              <ul>
                ${result.alternatives.map(alt => `<li>${alt}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${result.preventionTips && result.preventionTips.length > 0 ? `
            <div class="section">
              <div class="section-title">Prevention Tips</div>
              <ul>
                ${result.preventionTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${result.safetyPrecautions && result.safetyPrecautions.length > 0 ? `
            <div class="section">
              <div class="section-title">⚠️ Safety Precautions</div>
              <ul>
                ${result.safetyPrecautions.map(precaution => `<li>${precaution}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="footer">
            <p><strong>AgriNest POS</strong> - Premium Pesticide Management System</p>
            <p>Powered by ${result.source || 'AI'} ${result.responseTime ? `• Response Time: ${(result.responseTime / 1000).toFixed(1)}s` : ''}</p>
            <p style="margin-top: 10px; font-size: 11px;">
              This advisory is AI-generated and should be used as a guide. Always consult with a certified agronomist for critical decisions.
            </p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
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
                      onClick={() => uploadedImage ? detectFromImage() : getRecommendation(selectedIssue)}
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
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedIssue}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Crop: {cropData?.name} • Field: {fieldSize} acre(s)</p>
                    {result.confidence > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[200px]">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {(result.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    )}
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
                
                {/* Image Analysis Section */}
                {result.imageAnalysis && typeof result.imageAnalysis === 'object' && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image Analysis Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {result.imageAnalysis.symptoms && result.imageAnalysis.symptoms.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-300">Symptoms Detected:</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            {result.imageAnalysis.symptoms.map((symptom, idx) => (
                              <li key={idx} className="text-blue-700 dark:text-blue-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.imageAnalysis.affectedArea && (
                        <p className="text-blue-700 dark:text-blue-400">
                          <span className="font-medium text-blue-800 dark:text-blue-300">Affected Area:</span> {result.imageAnalysis.affectedArea}
                        </p>
                      )}
                      {result.imageAnalysis.stage && (
                        <p className="text-blue-700 dark:text-blue-400">
                          <span className="font-medium text-blue-800 dark:text-blue-300">Disease Stage:</span> {result.imageAnalysis.stage}
                        </p>
                      )}
                      {result.imageAnalysis.visualIndicators && result.imageAnalysis.visualIndicators.length > 0 && (
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-300">Visual Indicators:</span>
                          <ul className="ml-4 mt-1 space-y-1">
                            {result.imageAnalysis.visualIndicators.map((indicator, idx) => (
                              <li key={idx} className="text-blue-700 dark:text-blue-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-500" />Recommended Products
                  </h3>
                  
                  {/* Display full product details if available */}
                  {result.fullProducts && result.fullProducts.length > 0 && typeof result.fullProducts[0] === 'object' ? (
                    <div className="space-y-3 mb-4">
                      {result.fullProducts.map((product, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          <p className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">{product.name}</p>
                          {product.activeIngredient && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                              Active: {product.activeIngredient}
                            </p>
                          )}
                          {product.dosagePerAcre && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">
                              Dosage: {product.dosagePerAcre}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(result.products || []).map((p, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">{p}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-400 mb-1">Dosage</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{result.dosage}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />Safety Interval</p>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{result.safetyInterval} days</p>
                    </div>
                  </div>
                  {result.applicationMethod && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Application Method</p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">{result.applicationMethod}</p>
                    </div>
                  )}
                  {result.bestTimeToApply && (
                    <div className="mt-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />Best Time to Apply
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-300">{result.bestTimeToApply}</p>
                    </div>
                  )}
                  {fieldSize > 0 && result.fullProducts?.[0]?.dosagePerAcre && (
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
                  {(result.safetyPrecautions && result.safetyPrecautions.length > 0 
                    ? result.safetyPrecautions 
                    : SAFETY_PRECAUTIONS.slice(0, 6)
                  ).map((tip, i) => (
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
                <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <Printer className="w-4 h-4" />Save & Print
                </button>
              </div>

              {/* AI Response Metadata */}
              {(result.source || result.responseTime > 0 || result.cached) && (
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  {result.source && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Powered by {result.source}
                    </span>
                  )}
                  {result.responseTime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(result.responseTime / 1000).toFixed(1)}s
                    </span>
                  )}
                  {result.cached && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                      Cached
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/50 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedIssue || "Unable to detect from image"}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Crop: {cropData?.name} • Field: {fieldSize} acre(s)</p>
                  </div>
                  <SeverityBadge severity="Medium" />
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
                <p className="text-amber-900 dark:text-amber-300 font-semibold mb-2">Image analysis failed. Please select the issue manually or provide more details about symptoms on your {cropData?.name} crop.</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">⚠️ Consult with agronomist for accurate diagnosis</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep(2); setResult(null); setSelectedIssue(null); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--pos-primary)" }}>
                  ← Select Issue Manually
                </button>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <RefreshCw className="w-4 h-4" />Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedPestDiagnosis;
